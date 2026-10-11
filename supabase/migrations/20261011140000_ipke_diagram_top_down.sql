-- Eight boxes left-to-right render too small to read; stack the IPKE pipeline diagram vertically.
update public.projects
set full_description = replace(full_description, E'```mermaid\nflowchart LR', E'```mermaid\nflowchart TD')
where title = 'IPKE: Auditable Procedure Graphs from Industrial Documents with Local LLMs';
