import {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {create, findOne, update} from "@/lib/db";
import {IStudent} from "@/lib/types";

/**
 * Update a student's login streak. Replaces the former Mongoose instance
 * method. Returns the new streak so the session can reflect it immediately.
 */
async function checkStreak(student: IStudent & {_id: string}): Promise<number> {
    const now = new Date();
    const lastLoginDate = new Date(student.lastLogin);
    let streak = student.streak ?? 0;

    const sameDay = now.toDateString() === lastLoginDate.toDateString();
    if (!sameDay) {
        const daysSinceLastLogin =
            (now.valueOf() - lastLoginDate.valueOf()) / (1000 * 3600 * 24);
        streak = daysSinceLastLogin >= 2 ? 1 : streak + 1;
    }

    await update("students", student._id, {streak, lastLogin: now.toISOString()});
    return streak;
}

const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/signin",
        newUser: "/signup",
        error: "/signin",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // 1 hour
    },
    callbacks: {
        async signIn({account, profile, user}): Promise<string | boolean> {
            if (account?.provider !== "google" || !profile?.email) {
                return true;
            }

            // First-time sign in: provision a student record in Firestore.
            const existing = await findOne<IStudent>("students", "email", profile.email);
            if (!existing) {
                await create("students", {
                    name: user.name ?? profile.name ?? "",
                    email: profile.email,
                    image: user.image ?? (profile as {picture?: string}).picture ?? "",
                    bio: "",
                    streak: 1,
                    lastLogin: new Date().toISOString(),
                });
            }

            return true;
        },
        async session({session}) {
            if (!session.user?.email) return session;

            const student = await findOne<IStudent>("students", "email", session.user.email);
            if (student) {
                let streak = student.streak;
                try {
                    streak = await checkStreak(student);
                } catch (error) {
                    console.error("Error checking login streak:", error);
                }
                session.user = {
                    ...session.user,
                    _id: student._id,
                    streak,
                    university: student.university,
                    program: student.program,
                    department: student.department,
                };
            }

            return session;
        },
    },
};

export default authOptions;
