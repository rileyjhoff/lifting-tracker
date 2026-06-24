"use client";

import * as React from "react";
import dayjs from "dayjs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import type { Exercise, WorkoutDetail } from "@/lib/types";
import {
  deleteWorkout,
  updateWorkoutMeta,
} from "@/app/actions";
import ExercisePicker from "./ExercisePicker";
import ExerciseSetsEditor from "./ExerciseSetsEditor";

export default function WorkoutDialog({
  open,
  dateISO,
  workout,
  exercises,
  onClose,
}: {
  open: boolean;
  dateISO: string | null;
  workout: WorkoutDetail | null;
  exercises: Exercise[];
  onClose: () => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [pending, startTransition] = React.useTransition();

  const heading = dateISO
    ? dayjs(dateISO).format("dddd, MMMM D, YYYY")
    : "";

  const run = (fn: () => Promise<unknown>) =>
    startTransition(() => {
      void fn();
    });

  const exerciseList = workout?.workout_exercises ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
      <Box sx={{ height: 4 }}>{pending && <LinearProgress />}</Box>
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600 }}>
          {heading}
        </Typography>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {workout && (
          <TextField
            key={`title-${workout.id}`}
            defaultValue={workout.title ?? ""}
            placeholder="Workout title (e.g. Push Day)"
            variant="standard"
            fullWidth
            sx={{ mb: 2 }}
            onBlur={(e) => {
              const value = e.target.value.trim() || null;
              if (value !== (workout.title ?? null)) {
                run(() => updateWorkoutMeta(workout.id, { title: value }));
              }
            }}
          />
        )}

        {exerciseList.length === 0 && (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 2 }}
          >
            No exercises yet. Add one below to start this workout.
          </Typography>
        )}

        <Stack spacing={2}>
          {exerciseList.map((we) => (
            <ExerciseSetsEditor key={we.id} workoutExercise={we} />
          ))}
        </Stack>

        {exerciseList.length > 0 && <Divider sx={{ my: 2 }} />}

        {dateISO && (
          <ExercisePicker dateISO={dateISO} exercises={exercises} />
        )}

        {workout && (
          <TextField
            key={`notes-${workout.id}`}
            defaultValue={workout.notes ?? ""}
            placeholder="Notes for this session…"
            label="Notes"
            multiline
            minRows={2}
            fullWidth
            sx={{ mt: 3 }}
            onBlur={(e) => {
              const value = e.target.value.trim() || null;
              if (value !== (workout.notes ?? null)) {
                run(() => updateWorkoutMeta(workout.id, { notes: value }));
              }
            }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Box>
          {workout && (
            <Button
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => {
                run(async () => {
                  await deleteWorkout(workout.id);
                });
                onClose();
              }}
            >
              Delete workout
            </Button>
          )}
        </Box>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
