
import { supabase } from './activityService';
import { Profile } from '../types';

export const authService = {
    async signUp(email: string, password: string, username: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                },
                emailRedirectTo: window.location.origin,
            }
        });

        if (error) throw error;

        if (data.user) {
            // Profiles are usually handled via triggers in Supabase, 
            // but for this implementation we'll manually ensure it exists if needed.
            // However, the best way is a trigger. I'll stick to auth metadata for now 
            // and a profiles table check.
            await this.ensureProfile(data.user.id, username);
        }

        return data;
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    async sendOtp(email: string) {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false // Only for existing users if using for login
            }
        });
        if (error) throw error;
    },

    async verifyOtp(email: string, token: string, type: 'signup' | 'login' | 'magiclink' = 'signup') {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: type as any
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        return data;
    },

    async ensureProfile(userId: string, username: string) {
        const { data: existing } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (!existing) {
            await supabase
                .from('profiles')
                .insert([{ id: userId, username }]);
        }
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const profile = await this.getProfile(user.id);
        return {
            ...user,
            username: profile?.username || user.user_metadata.username || 'Anonymous'
        };
    },

    onAuthStateChange(callback: (user: any) => void) {
        return supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await this.getProfile(session.user.id);
                callback({
                    ...session.user,
                    username: profile?.username || session.user.user_metadata.username || 'Anonymous'
                });
            } else {
                callback(null);
            }
        });
    }
};
