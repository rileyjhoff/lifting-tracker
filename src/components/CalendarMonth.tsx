"use client";

import * as React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { alpha } from "@mui/material/styles";
import type { Exercise, WorkoutDetail } from "@/lib/types";
import WorkoutDialog from "./WorkoutDialog";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarMonth({
  monthISO,
  todayISO,
  workouts,
  exercises,
}: {
  monthISO: string;
  todayISO: string;
  workouts: WorkoutDetail[];
  exercises: Exercise[];
}) {
  const monthStart = dayjs(`${monthISO}-01`);
  const gridStart = monthStart.startOf("month").startOf("week");
  const gridEnd = monthStart.endOf("month").endOf("week");

  const days = React.useMemo(() => {
    const out: dayjs.Dayjs[] = [];
    let d = gridStart;
    while (d.isBefore(gridEnd) || d.isSame(gridEnd, "day")) {
      out.push(d);
      d = d.add(1, "day");
    }
    return out;
  }, [gridStart, gridEnd]);

  const byDate = React.useMemo(() => {
    const map = new Map<string, WorkoutDetail>();
    for (const w of workouts) map.set(w.workout_date, w);
    return map;
  }, [workouts]);

  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  // `todayISO` is the server's date (UTC on Vercel). Re-derive "today" from the
  // browser clock after mount so the highlight and "Today" button reflect the
  // user's actual local day regardless of the server's timezone.
  const [clientToday, setClientToday] = React.useState(todayISO);
  React.useEffect(() => {
    setClientToday(dayjs().format("YYYY-MM-DD"));
  }, []);

  const prevMonth = monthStart.subtract(1, "month").format("YYYY-MM");
  const nextMonth = monthStart.add(1, "month").format("YYYY-MM");
  const thisMonth = dayjs(clientToday).format("YYYY-MM");

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ mb: 2, alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          {monthStart.format("MMMM YYYY")}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Button
            component={Link}
            href={`/?month=${thisMonth}`}
            size="small"
            variant="outlined"
          >
            Today
          </Button>
          <IconButton
            component={Link}
            href={`/?month=${prevMonth}`}
            aria-label="Previous month"
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            component={Link}
            href={`/?month=${nextMonth}`}
            aria-label="Next month"
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: { xs: 0.5, sm: 1 },
          mb: 1,
        }}
      >
        {WEEKDAYS.map((wd) => (
          <Typography
            key={wd}
            variant="caption"
            align="center"
            sx={{ color: "text.secondary", fontWeight: 600 }}
          >
            {wd}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {days.map((day) => {
          const iso = day.format("YYYY-MM-DD");
          const inMonth = day.month() === monthStart.month();
          const isToday = iso === clientToday;
          const workout = byDate.get(iso);
          const exCount = workout?.workout_exercises.length ?? 0;
          const setCount =
            workout?.workout_exercises.reduce(
              (sum, we) => sum + we.sets.length,
              0,
            ) ?? 0;

          return (
            <Paper
              key={iso}
              variant="outlined"
              data-date={iso}
              onClick={() => setSelectedDate(iso)}
              sx={{
                p: { xs: 0.5, sm: 1 },
                minHeight: { xs: 64, sm: 104 },
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                opacity: inMonth ? 1 : 0.45,
                borderColor: isToday ? "primary.main" : "divider",
                borderWidth: isToday ? 2 : 1,
                bgcolor: workout
                  ? (t) => alpha(t.palette.primary.main, 0.06)
                  : "background.paper",
                transition: "border-color .15s, background-color .15s",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? "primary.main" : "text.primary",
                  }}
                >
                  {day.date()}
                </Typography>
                {/* Compact indicator for small screens. */}
                {workout && (
                  <Box
                    sx={{
                      display: { xs: "block", sm: "none" },
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                    }}
                  />
                )}
              </Stack>

              {/* Exercise summary for larger screens. */}
              {workout && (
                <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 0 }}>
                  {workout.workout_exercises.slice(0, 3).map((we) => (
                    <Typography
                      key={we.id}
                      variant="caption"
                      noWrap
                      component="div"
                      sx={{ color: "text.secondary", lineHeight: 1.4 }}
                    >
                      {we.exercise.name}
                    </Typography>
                  ))}
                  {exCount > 3 && (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontWeight: 600 }}
                    >
                      +{exCount - 3} more
                    </Typography>
                  )}
                </Box>
              )}

              {workout && exCount > 0 && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`${exCount} ex · ${setCount} sets`}
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    mt: "auto",
                    height: 20,
                    fontSize: 11,
                  }}
                />
              )}
            </Paper>
          );
        })}
      </Box>

      <WorkoutDialog
        open={selectedDate !== null}
        dateISO={selectedDate}
        workout={selectedDate ? (byDate.get(selectedDate) ?? null) : null}
        exercises={exercises}
        onClose={() => setSelectedDate(null)}
      />
    </Box>
  );
}
