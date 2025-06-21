import anyio
from claude_code_sdk import query, ClaudeCodeOptions

async def main():
    with open("prompt.md", "r") as f:
        prompt = f.read()
    options = ClaudeCodeOptions(
        max_turns=5,
        allowed_tools=["Read", "Write", "Bash"],
        permission_mode="acceptEdits"
    )
    async for msg in query(prompt=prompt, options=options):
        print(msg.text)

if __name__ == "__main__":
    anyio.run(main)
