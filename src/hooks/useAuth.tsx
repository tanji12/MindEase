import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Also subscribe to role changes for the current user so we can
    // automatically refresh the auth session when roles are updated server-side.
    let roleSubscription: ReturnType<typeof supabase.channel> | null = null;

    const setupRoleSubscription = () => {
      // Only subscribe when we have a user
      if (!subscription || !session?.user) return;

      try {
        roleSubscription = supabase
          .channel(`role_changes_user_${session.user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'user_roles', filter: `user_id=eq.${session.user.id}` },
            async () => {
              try {
                // Prefer using the official refresh API if available
                // @ts-ignore - supabase-js may not have types for refreshSession here
                if (typeof supabase.auth.refreshSession === 'function') {
                  // This will trigger onAuthStateChange with the refreshed session
                  // and update state accordingly.
                  // @ts-ignore
                  await supabase.auth.refreshSession();
                } else {
                  // Fallback: re-set session using stored refresh token so the SDK refreshes tokens
                  const {
                    data: { session: currentSession },
                  } = await supabase.auth.getSession();
                  if (currentSession?.refresh_token) {
                    // @ts-ignore
                    await supabase.auth.setSession({ refresh_token: currentSession.refresh_token });
                  }
                }
              } catch (err) {
                console.error('Failed to refresh session after role change', err);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Failed to subscribe to role changes', err);
      }
    };

    // If we already have a session, set up subscription right away.
    setupRoleSubscription();

    // Also watch for changes to the session/user and (re)setup the role subscription.
    // Create a small listener to respond to session updates.
    const { data: { subscription: sessionWatcher } } = supabase.auth.onAuthStateChange((_, newSession) => {
      // re-run subscription when the user changes
      try {
        if (roleSubscription) {
          roleSubscription.unsubscribe();
          roleSubscription = null;
        }
      } catch (e) {
        // ignore
      }

      if (newSession?.user) {
        // update local session var used by setupRoleSubscription
        // NOTE: we rely on outer `session` state being updated by the primary listener above,
        // but call setupRoleSubscription to ensure subscription is active for new user.
        // small timeout to allow state to update
        setTimeout(setupRoleSubscription, 0);
      }
    });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (e) {
        // ignore unsubscribe errors
      }
      try {
        sessionWatcher.unsubscribe();
      } catch (e) {
        // ignore
      }
      try {
        if (roleSubscription) roleSubscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
};
