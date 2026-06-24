"use client";

import * as React from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import type { Exercise } from "@/lib/types";
import { MUSCLE_GROUPS, EQUIPMENT, muscleSortIndex } from "@/lib/exercises/catalog";
import { addExerciseToDate, createCustomExercise } from "@/app/actions";

export default function ExercisePicker({
  dateISO,
  exercises,
}: {
  dateISO: string;
  exercises: Exercise[];
}) {
  const [pending, startTransition] = React.useTransition();
  const [showCustom, setShowCustom] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Custom-exercise form state.
  const [name, setName] = React.useState("");
  const [customMuscle, setCustomMuscle] = React.useState<string>(MUSCLE_GROUPS[0]);
  const [equipment, setEquipment] = React.useState<string>(EQUIPMENT[0]);

  // Muscle groups actually present in the catalog (canonical order), so the
  // dropdown only lists groups that have exercises.
  const muscleGroups = React.useMemo(() => {
    const present = new Set(exercises.map((e) => e.primary_muscle));
    return [...present].sort((a, b) => muscleSortIndex(a) - muscleSortIndex(b));
  }, [exercises]);

  const [browseMuscle, setBrowseMuscle] = React.useState<string>(
    muscleGroups[0] ?? MUSCLE_GROUPS[0],
  );

  // Keep the selected group valid if the catalog changes (e.g. after adding a
  // custom exercise in a new group).
  React.useEffect(() => {
    if (muscleGroups.length && !muscleGroups.includes(browseMuscle)) {
      setBrowseMuscle(muscleGroups[0]);
    }
  }, [muscleGroups, browseMuscle]);

  const exercisesInGroup = React.useMemo(
    () => exercises.filter((e) => e.primary_muscle === browseMuscle),
    [exercises, browseMuscle],
  );

  const add = (exerciseId: string) =>
    startTransition(async () => {
      setError(null);
      try {
        await addExerciseToDate(dateISO, exerciseId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't add the exercise.");
      }
    });

  const createAndAdd = () =>
    startTransition(async () => {
      setError(null);
      try {
        const created = await createCustomExercise({
          name,
          primary_muscle: customMuscle,
          equipment,
        });
        await addExerciseToDate(dateISO, created.id);
        setName("");
        setShowCustom(false);
        // Jump the browse dropdown to the new exercise's group so it's visible.
        setBrowseMuscle(created.primary_muscle);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        setError(
          /duplicate/i.test(msg)
            ? `You already have an exercise named “${name.trim()}”.`
            : msg || "Couldn't create the exercise.",
        );
      }
    });

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: "stretch" }}>
        <TextField
          select
          label="Muscle group"
          value={browseMuscle}
          onChange={(e) => setBrowseMuscle(e.target.value)}
          size="small"
          sx={{ minWidth: { sm: 150 } }}
        >
          {muscleGroups.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label={`Exercise (${exercisesInGroup.length})`}
          value=""
          disabled={pending || exercisesInGroup.length === 0}
          onChange={(e) => {
            if (e.target.value) add(e.target.value);
          }}
          size="small"
          sx={{ flexGrow: 1 }}
          slotProps={{
            select: { displayEmpty: true },
            inputLabel: { shrink: true },
          }}
        >
          <MenuItem value="" disabled>
            Select an exercise to add…
          </MenuItem>
          {exercisesInGroup.map((ex) => (
            <MenuItem key={ex.id} value={ex.id} data-testid="exercise-option">
              {ex.name}
              {ex.is_custom ? " ★" : ""}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setShowCustom((v) => !v)}
          sx={{ whiteSpace: "nowrap" }}
          data-testid="new-exercise-toggle"
        >
          New exercise
        </Button>
      </Stack>

      <Collapse in={showCustom}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mt: 1.5, alignItems: "stretch" }}
        >
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            slotProps={{ htmlInput: { "data-testid": "custom-name" } }}
          />
          <TextField
            select
            label="Muscle"
            value={customMuscle}
            onChange={(e) => setCustomMuscle(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            {MUSCLE_GROUPS.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Equipment"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            size="small"
            sx={{ minWidth: 130 }}
          >
            {EQUIPMENT.map((eq) => (
              <MenuItem key={eq} value={eq}>
                {eq}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            disabled={!name.trim() || pending}
            onClick={createAndAdd}
            data-testid="custom-add"
          >
            Add
          </Button>
        </Stack>
      </Collapse>
    </Box>
  );
}
