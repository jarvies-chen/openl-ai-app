import sys
import os
import asyncio
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import Rule, generate_excel, Datatype, GenerationRequest

# Mock data
mock_rules = [
    Rule(
        id="1",
        name="CalcProphyFreq",
        summary="Prophylaxis is allowed twice per benefit period",
        condition_text="Prophylaxis (D1110, D1120) is payable twice (2) per benefit period. Frequency is combined.",
        condition="count(D1110, D1120) <= 2",
        result="true",
        source_text="Prophylaxis (D1110, D1120) is payable twice (2) per benefit period.",
        rule_type="Spreadsheet",
        related_codes=["D1110", "D1120"],
        time_period="Benefit Period",
        category="Frequency"
    )
]

mock_datatypes = [
    Datatype(name="Claim", fields=[{"name": "code", "type": "String"}, {"name": "date", "type": "Date"}]),
    Datatype(name="History", fields=[{"name": "procedures", "type": "Procedure[]"}])
]

async def test_generation():
    print("Starting test generation...")
    try:
        request = GenerationRequest(rules=mock_rules, datatypes=mock_datatypes)
        
        print(f"Sending request to generate_excel...")
        
        # Invoke generate_excel
        # Note: generate_excel returns a dict with download_url
        response = await generate_excel(request)
        
        print("\nResponse:")
        print(response)
        
        if response and "download_url" in response:
            print("\nSUCCESS: Generated Excel file.")
            # We can't easily inspect the file content here without reading it back, 
            # but success means the LLM generated valid JSON structure.
        else:
            print("\nFAILURE: Did not generate Excel file.")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    load_dotenv("backend/.env")
    asyncio.run(test_generation())
