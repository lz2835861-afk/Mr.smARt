import { useCallback, useEffect, useState } from "react";
import { getAllQuestionnaires, type Questionnaire } from "../data/questionnaires";
import {
  refreshCloudQuestionnaireCache,
  subscribeContentChanges,
} from "../lib/contentRepository";
import { isRemoteEnabled, supabase } from "../lib/supabase";

export function useQuestionnaireCatalog(includeHidden: boolean) {
  const readLocal = useCallback(
    () => getAllQuestionnaires({ includeHidden }),
    [includeHidden],
  );
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(readLocal);
  const [loading, setLoading] = useState(isRemoteEnabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      await refreshCloudQuestionnaireCache();
      setQuestionnaires(readLocal());
    } catch (err) {
      setQuestionnaires(readLocal());
      setError(err instanceof Error ? err.message : "共享问卷加载失败");
    } finally {
      setLoading(false);
    }
  }, [readLocal]);

  useEffect(() => {
    void reload();
    const channel = subscribeContentChanges(() => void reload());
    return () => {
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [reload]);

  const refreshLocal = useCallback(() => setQuestionnaires(readLocal()), [readLocal]);

  return { questionnaires, loading, error, reload, refreshLocal };
}
