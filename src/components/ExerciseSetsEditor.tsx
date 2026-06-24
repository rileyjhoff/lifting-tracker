"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import type { WorkoutExercise } from "@/lib/types";
import {
  addSet,
  removeSet,
  removeWorkoutExercise,
  setExerciseUnit,
  updateRest,
  updateSet,
} from "@/app/actions";

function toNumOrNull(value: string): number | null {
  const t = value.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function ExerciseSetsEditor({
  workoutExercise: we,
}: {
  workoutExercise: WorkoutExercise;
}) {
  const [pending, startTransition] = React.useTransition();
  const run = (fn: () => Promise<unknown>) =>
    startTransition(() => {
      void fn();
    });

  const unit = we.sets[0]?.unit ?? "lb";

  // Local state for the optional rest fields; saved together on blur.
  const [restBetween, setRestBetween] = React.useState(
    we.rest_between_sets_seconds?.toString() ?? "",
  );
  const [restAfter, setRestAfter] = React.useState(
    we.rest_after_exercise_seconds?.toString() ?? "",
  );

  const saveRest = () => {
    const between = toNumOrNull(restBetween);
    const after = toNumOrNull(restAfter);
    if (
      between !== we.rest_between_sets_seconds ||
      after !== we.rest_after_exercise_seconds
    ) {
      run(() => updateRest(we.id, between, after));
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, opacity: pending ? 0.7 : 1, transition: "opacity .15s" }}
    >
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {we.exercise.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {we.exercise.primary_muscle} · {we.exercise.equipment}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={unit}
            onChange={(_, v) => {
              if (v && v !== unit) run(() => setExerciseUnit(we.id, v));
            }}
          >
            <ToggleButton value="lb" sx={{ px: 1.2, py: 0.2 }}>
              lb
            </ToggleButton>
            <ToggleButton value="kg" sx={{ px: 1.2, py: 0.2 }}>
              kg
            </ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Remove exercise">
            <IconButton
              size="small"
              onClick={() => run(() => removeWorkoutExercise(we.id))}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Sets table */}
      <Box sx={{ mt: 1.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 1fr 32px",
            gap: 1,
            alignItems: "center",
            px: 0.5,
            mb: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            #
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Weight ({unit})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Reps
          </Typography>
          <span />
        </Box>

        <Stack spacing={1}>
          {we.sets.map((set, idx) => (
            <Box
              key={set.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "32px 1fr 1fr 32px",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary" align="center">
                {idx + 1}
              </Typography>
              <TextField
                defaultValue={set.weight ?? ""}
                type="number"
                size="small"
                placeholder="—"
                slotProps={{ htmlInput: { inputMode: "decimal", step: "any" } }}
                onBlur={(e) => {
                  const val = toNumOrNull(e.target.value);
                  if (val !== set.weight) {
                    run(() => updateSet(set.id, { weight: val }));
                  }
                }}
              />
              <TextField
                defaultValue={set.reps ?? ""}
                type="number"
                size="small"
                placeholder="—"
                slotProps={{ htmlInput: { inputMode: "numeric", step: "1" } }}
                onBlur={(e) => {
                  const val = toNumOrNull(e.target.value);
                  if (val !== set.reps) {
                    run(() => updateSet(set.id, { reps: val }));
                  }
                }}
              />
              <IconButton
                size="small"
                aria-label={`Remove set ${idx + 1}`}
                disabled={we.sets.length <= 1}
                onClick={() => run(() => removeSet(set.id))}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>

        <Button
          size="small"
          startIcon={<AddIcon />}
          sx={{ mt: 1 }}
          data-testid="add-set"
          onClick={() => run(() => addSet(we.id))}
        >
          Add set
        </Button>
      </Box>

      {/* Optional rest timings */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 1.5, color: "text.secondary", alignItems: "center" }}
      >
        <TimerOutlinedIcon fontSize="small" />
        <TextField
          label="Rest / sets (s)"
          value={restBetween}
          onChange={(e) => setRestBetween(e.target.value)}
          onBlur={saveRest}
          type="number"
          size="small"
          slotProps={{ htmlInput: { inputMode: "numeric", step: "5", min: 0 } }}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Rest after (s)"
          value={restAfter}
          onChange={(e) => setRestAfter(e.target.value)}
          onBlur={saveRest}
          type="number"
          size="small"
          slotProps={{ htmlInput: { inputMode: "numeric", step: "5", min: 0 } }}
          sx={{ flex: 1 }}
        />
      </Stack>
    </Paper>
  );
}
