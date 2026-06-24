import { redirect } from "next/navigation";
import dayjs from "dayjs";
import Container from "@mui/material/Container";
import { createClient } from "@/lib/supabase/server";
import { getWorkoutsInRange, getExerciseCatalog } from "@/lib/db/queries";
import CalendarMonth from "@/components/CalendarMonth";
import Header from "@/components/Header";

// Always render fresh, per-user data (reads auth + cookies).
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const monthISO =
    sp.month && /^\d{4}-\d{2}$/.test(sp.month)
      ? sp.month
      : dayjs().format("YYYY-MM");

  const monthStart = dayjs(`${monthISO}-01`);
  const gridStart = monthStart.startOf("month").startOf("week");
  const gridEnd = monthStart.endOf("month").endOf("week");

  const [workouts, exercises] = await Promise.all([
    getWorkoutsInRange(
      gridStart.format("YYYY-MM-DD"),
      gridEnd.format("YYYY-MM-DD"),
    ),
    getExerciseCatalog(),
  ]);

  return (
    <>
      <Header userEmail={user.email ?? ""} />
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
        <CalendarMonth
          monthISO={monthISO}
          todayISO={dayjs().format("YYYY-MM-DD")}
          workouts={workouts}
          exercises={exercises}
        />
      </Container>
    </>
  );
}
