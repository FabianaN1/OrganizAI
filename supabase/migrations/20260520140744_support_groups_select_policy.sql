
/*
  # Add SELECT policy on support_groups
  Requires group_memberships to exist first (created in initial_schema_v1).
*/

CREATE POLICY "Authenticated users can view public groups"
  ON support_groups FOR SELECT TO authenticated
  USING (is_private = false OR created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM group_memberships WHERE group_id = support_groups.id AND user_id = auth.uid()
  ));
