"use client";

import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import type { Exercise } from "@/lib/types";
import { MUSCLE_GROUPS, EQUIPMENT } from "@/lib/exercises/catalog";
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

  const [name, setName] = React.useState("");
  const [muscle, setMuscle] = React.useState<string>(MUSCLE_GROUPS[0]);
  const [equipment, setEquipment] = React.useState<string>(EQUIPMENT[0]);

  const add = (exerciseId: string) =>
    startTransition(() => {
      void addExerciseToDate(dateISO, exerciseId);
    });

  const createAndAdd = () =>
    startTransition(async () => {
      const created = await createCustomExercise({
        name,
        primary_muscle: muscle,
        equipment,
      });
      await addExerciseToDate(dateISO, created.id);
      setName("");
      setShowCustom(false);
    });

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: "stretch" }}>
        <Autocomplete<Exercise>
          options={exercises}
          groupBy={(o) => o.primary_muscle}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          value={null}
          blurOnSelect
          disabled={pending}
          onChange={(_, value) => {
            if (value) add(value.id);
          }}
          sx={{ flexGrow: 1 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Add exercise"
              placeholder="Search the catalog…"
            />
          )}
        />
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
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
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
