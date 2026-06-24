import dayjs from "dayjs";
import { getWorkoutsInRange, getExerciseCatalog } from "@/lib/db/queries";
import CalendarMonth from "@/components/CalendarMonth";

// Always render fresh from the database (no static caching of workout data).
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const monthISO =
    sp.month && /^\d{4}-\d{2}$/.test(sp.month)
      ? sp.month
      : dayjs().format("YYYY-MM");

  // Load every workout visible in the month grid, including the leading/trailing
  // days that spill in from adjacent months.
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
    <CalendarMonth
      monthISO={monthISO}
      todayISO={dayjs().format("YYYY-MM-DD")}
      workouts={workouts}
      exercises={exercises}
    />
  );
}
