
-- Change page_flows.steps to be an array of step objects (if not already)
-- Each step can be { sub_page_id: text, action: text (e.g., "next", "jump_to"), jump_to_index: int (optional) }.

-- (No column change needed, but we recommend standardizing structure and adding a comment.)

COMMENT ON COLUMN public.page_flows.steps IS
'Array of step objects. Each object: { sub_page_id: text, action: text, jump_to_index: int (optional) }. Action is typically "next" or "jump_to".';

-- Add example structure for documentation:
-- [
--   { "sub_page_id": "sub1", "action": "next" },
--   { "sub_page_id": "sub2", "action": "jump_to", "jump_to_index": 0 }
-- ]

-- No actual migration needed unless you want stricter checking or want to migrate old data.

