import json
import boto3

lambda_client = boto3.client("lambda")


class ToolProvider:
    def __init__(self, tools: dict = {}):
        self.tools = tools

    def get_tool_arn(self, tool_name):
        if tool_name in self.tools:
            return self.tools[tool_name]
        else:
            return None

    def execute(self, payload):
        print(json.dumps(payload, indent=2))

        tool_name = payload["name"]

        # Custom handling for get_skill
        if tool_name == "get_skill":
            try:
                import os
                
                skill_name = payload["input"]["skill_name"]
                # Resolve path relative to this file: ../skills/{skill_name}
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                skill_dir = os.path.join(base_dir, "skills", skill_name)
                
                skill_file = os.path.join(skill_dir, "SKILL.md")
                recalc_file = os.path.join(skill_dir, "recalc.py")
                
                content_text = ""
                
                if os.path.exists(skill_file):
                    with open(skill_file, "r") as f:
                        content_text += f"# {skill_name.upper()} SKILL INSTRUCTIONS:\n\n"
                        content_text += f.read()
                        content_text += "\n\n"
                else:
                     return {"status": "error", "content": {"text": f"Skill '{skill_name}' instructions not found."}}

                if os.path.exists(recalc_file):
                    with open(recalc_file, "r") as f:
                        content_text += f"# COMPANION SCRIPT (recalc.py) for {skill_name}:\n"
                        content_text += "```python\n"
                        content_text += f.read()
                        content_text += "\n```\n"

                return {
                    "status": "success",
                    "content": {"text": content_text},
                }
            except Exception as e:
                return {
                    "status": "error",
                    "content": {"text": f"Error loading skill: {str(e)}"},
                }

        tool_arn = self.get_tool_arn(tool_name)
        if tool_arn is None:
            return {
                "status": "error",
                "content": [{"text": f"Tool {tool_name} not found."}],
            }

        response = lambda_client.invoke(
            FunctionName=tool_arn,
            InvocationType="RequestResponse",
            Payload=json.dumps(payload),
        )

        response_payload = json.load(response["Payload"])

        print(json.dumps(response_payload, indent=2))

        status = response_payload["status"]
        content = response_payload.get("content", {})
        extra = response_payload.get("extra", {})

        return {"status": status, "content": content, "extra": extra}
