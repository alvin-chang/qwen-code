<!-- Powered by BMAD™ Core -->

# Memory Management Task

## Purpose

To demonstrate and utilize the full range of memory management operations including storing, searching, updating, and deleting memories. This task helps maintain a clean and efficient memory system by periodically reviewing and managing stored memories.

## MEMORY-AWARE Task Execution

Before beginning any task execution, perform memory operations to enhance context awareness:

### Memory Initialization

1. Search project memory for existing memory management patterns:
   ```
   search_memory("DEV_CODE DEV_PATTERN memory management", project_id="{project_name}")
   ```

2. Store task initiation for tracking:
   ```
   store_memory("BMAD_TASK: Starting memory management task", project_id="{project_name}", agent_role="bmad-master")
   ```

## Task Execution

### 1. Review Existing Memories

1. Search for memories that might need updating or deletion:
   ```
   search_memory("*", project_id="{project_name}", limit=100)
   ```

2. Identify obsolete or outdated memories:
   ```
   search_memory("OBSOLETE DEPRECATED", project_id="{project_name}")
   ```

### 2. Update Relevant Memories

1. For memories that need updating, use the update_memory function:
   ```
   update_memory("{memory_id}", "Updated content with new information", project_id="{project_name}")
   ```

2. Example of updating a decision with new context:
   ```
   update_memory("ARCH_DECISION_DATABASE_CHOICE", "Updated: Selected PostgreSQL with TimescaleDB extension for time-series data optimization based on new requirements.", project_id="{project_name}", agent_role="architect")
   ```

### 3. Delete Obsolete Memories

1. For memories that are no longer relevant, use the delete_memory function:
   ```
   delete_memory("{memory_id}", project_id="{project_name}")
   ```

2. Example of deleting an obsolete technology decision:
   ```
   delete_memory("ARCH_DECISION_OBSOLETE_TECHNOLOGY", project_id="{project_name}", agent_role="architect")
   ```

### 4. Share Updated Memories

1. Share important updates with relevant agents:
   ```
   share_memory("{memory_id}", ["dev", "qa"], project_id="{project_name}", context="Updated decision affects implementation and testing")
   ```

## Memory Cleanup

### 1. Apply Retention Policies

1. Clean up old memories based on retention policies:
   ```
   cleanup_memories(retention_days=30, max_entries=1000, project_id="{project_name}")
   ```

### 2. Compress Memory Storage

1. Compress memories based on usage patterns:
   ```
   compress_memory(strategy="usage_frequency", threshold=100, project_id="{project_name}")
   ```

## Task Completion

### 1. Store Task Results

1. Store the results of memory management operations:
   ```
   store_memory("BMAD_TASK: Memory management completed - Updated {updated_count} memories, Deleted {deleted_count} memories", project_id="{project_name}", agent_role="bmad-master")
   ```

### 2. Generate Memory Report

1. Generate a report of memory operations performed:
   ```
   generate_memory_report(project_id="{project_name}")
   ```

## Best Practices

1. **Regular Maintenance**: Schedule periodic memory management tasks to keep the memory system clean and efficient.

2. **Selective Updates**: Only update memories when there's significant new information that affects decision-making.

3. **Careful Deletion**: Verify that memories are truly obsolete before deletion to avoid losing valuable context.

4. **Sharing Updates**: Share important memory updates with relevant agents to ensure everyone has current information.

5. **Retention Compliance**: Follow defined retention policies to automatically clean up old memories.

## Troubleshooting

1. **Memory Not Found**: If update or delete operations fail because a memory isn't found, verify the memory ID and search parameters.

2. **Permission Issues**: Ensure proper agent roles and permissions are set for memory operations.

3. **Storage Limits**: Monitor memory storage usage and apply compression when needed.

4. **Performance Issues**: For large memory stores, use filtering and limiting to avoid performance issues.

---

*This task is part of the BMAD™ methodology. For more information on BMAD agents and workflows, see the [BMAD documentation](../docs/).*