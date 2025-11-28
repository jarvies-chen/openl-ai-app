import sys
import os
import asyncio
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import Rule, generate_excel, Datatype, GenerationRequest

# Mock data based on user's complex example
mock_rules = [
    Rule(
        id="ELIG06",
        name="ValidateOrthodonticLateEntrantWaitingPeriod",
        summary="Check if orthodontic service is after waiting period for late entrants",
        condition="isLateEntrant AND isInOrthodonticServices(cdtCode) AND DateOfService >= HireDate + OrthodonticLateEntrantWaitingPeriod",
        result="Denied",
        source_text="Late entrants must wait for orthodontic services.",
        rule_type="DecisionTable",
        category="Eligibility"
    ),
    Rule(
        id="ELIG07",
        name="CheckActiveStatus",
        summary="Check if member is active",
        condition="status == 'Active'",
        result="true",
        source_text="Member must be active.",
        rule_type="SmartRules",
        category="Eligibility"
    )
]

mock_datatypes = [
    Datatype(name="Claim", fields=[{"name": "dateOfService", "type": "Date"}, {"name": "cdtCode", "type": "String"}]),
    Datatype(name="Policy", fields=[{"name": "orthodonticLateEntrantWaitingPeriod", "type": "Integer"}]),
    Datatype(name="Member", fields=[{"name": "hireDate", "type": "Date"}, {"name": "isLateEntrant", "type": "Boolean"}])
]

async def test_generation():
    print("Starting Decision Table generation test...")
    try:
        request = GenerationRequest(rules=mock_rules, datatypes=mock_datatypes)
        
        print(f"Sending request to generate_excel...")
        
        # Invoke generate_excel
        response = await generate_excel(request)
        
        print("\nResponse:")
        print(response)
        
        if response and "download_url" in response:
            print("\nSUCCESS: Generated Excel file.")
            # In a real test we would parse the Excel, but here we rely on the LLM output logs from the backend
        else:
            print("\nFAILURE: Did not generate Excel file.")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    load_dotenv("backend/.env")
    asyncio.run(test_generation())
