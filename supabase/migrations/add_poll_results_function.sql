-- Migration: Add function to efficiently fetch all poll results
-- This function returns vote counts and state breakdowns for all polls in one query
-- UPDATED: Using UUID for poll_id (not TEXT)

-- Function to get all poll results at once
CREATE OR REPLACE FUNCTION get_all_poll_results()
RETURNS TABLE (
  poll_id UUID,
  option_index INTEGER,
  total_votes BIGINT,
  state_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH vote_counts AS (
    SELECT 
      v.poll_id,
      v.option_index,
      COUNT(*) as vote_count,
      v.user_state
    FROM votes v
    GROUP BY v.poll_id, v.option_index, v.user_state
  ),
  aggregated_votes AS (
    SELECT 
      vc.poll_id,
      vc.option_index,
      SUM(vc.vote_count) as total_votes,
      jsonb_object_agg(
        vc.user_state, 
        vc.vote_count
      ) as state_breakdown
    FROM vote_counts vc
    GROUP BY vc.poll_id, vc.option_index
  )
  SELECT 
    av.poll_id,
    av.option_index,
    av.total_votes,
    av.state_breakdown
  FROM aggregated_votes av
  ORDER BY av.poll_id, av.option_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_all_poll_results() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_poll_results() TO anon;

-- Function to get results for a single poll (for detail view)
CREATE OR REPLACE FUNCTION get_poll_results(p_poll_id UUID)
RETURNS TABLE (
  option_index INTEGER,
  total_votes BIGINT,
  state_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH vote_counts AS (
    SELECT 
      v.option_index,
      COUNT(*) as vote_count,
      v.user_state
    FROM votes v
    WHERE v.poll_id = p_poll_id
    GROUP BY v.option_index, v.user_state
  ),
  aggregated_votes AS (
    SELECT 
      vc.option_index,
      SUM(vc.vote_count) as total_votes,
      jsonb_object_agg(
        vc.user_state, 
        vc.vote_count
      ) as state_breakdown
    FROM vote_counts vc
    GROUP BY vc.option_index
  )
  SELECT 
    av.option_index,
    av.total_votes,
    av.state_breakdown
  FROM aggregated_votes av
  ORDER BY av.option_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_poll_results(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_poll_results(UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION get_all_poll_results() IS 'Returns vote counts and state breakdowns for all polls efficiently (UUID version)';
COMMENT ON FUNCTION get_poll_results(UUID) IS 'Returns vote counts and state breakdown for a specific poll (UUID version)';

