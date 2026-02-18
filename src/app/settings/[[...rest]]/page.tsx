"use client";

import { UserProfile, useUser } from "@clerk/nextjs";
import { Sliders } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DIETARY_PREFERENCES } from "@/constants/dietary-preferences";

import { getUserPreferences, updateUserPreferences } from "../actions";

export default function SettingsPage() {
  const { isLoaded } = useUser();

  const [defaultServings, setDefaultServings] = useState(2);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load private metadata (read-only on client)
  useEffect(() => {
    if (!isLoaded) return;

    const loadPreferences = async () => {
      try {
        const data = await getUserPreferences();
        // Check types if necessary, but server action guarantees return shape
        setDefaultServings(data.defaultServings as number);
        setDietaryPreferences(data.dietaryPreferences as string[]);
      } catch {
        // Handle error if needed
      }
    };

    loadPreferences();
  }, [isLoaded]);

  const toggleDiet = (id: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await updateUserPreferences(defaultServings, dietaryPreferences);

      setSaved(true);
    } catch {
      setError("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <UserProfile>
        {/* ✅ ONLY custom page — built-in Account & Security stay intact */}
        <UserProfile.Page
          label="App Preferences"
          url="preferences"
          labelIcon={<Sliders className="h-4 w-4" />}
        >
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Default Servings */}
              <div className="space-y-2">
                <Label htmlFor="defaultServings">Default Servings</Label>
                <Input
                  id="defaultServings"
                  type="number"
                  min={1}
                  max={20}
                  value={defaultServings}
                  onChange={(e) => setDefaultServings(Number(e.target.value))}
                  className="w-32"
                />
                <p className="text-muted-foreground text-sm">
                  Used as the default when creating new recipes.
                </p>
              </div>

              {/* Dietary Preferences */}
              <div className="space-y-3">
                <Label>Dietary Preferences</Label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {DIETARY_PREFERENCES.map((pref) => (
                    <div key={pref.id} className="flex items-center gap-2">
                      <Checkbox
                        id={pref.id}
                        checked={dietaryPreferences.includes(pref.id)}
                        onCheckedChange={() => toggleDiet(pref.id)}
                      />
                      <Label htmlFor={pref.id} className="font-normal">
                        {pref.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Preferences"}
                </Button>

                {saved && (
                  <span className="text-sm text-green-600">
                    Preferences saved
                  </span>
                )}

                {error && <span className="text-sm text-red-600">{error}</span>}
              </div>
            </CardContent>
          </Card>
        </UserProfile.Page>
      </UserProfile>
    </div>
  );
}
