import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openai import OpenAI
import os

# Initialize Groq client with API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

MODEL = "openai/gpt-oss-120b"

def read_excel_prompts(filename):
    """Read prompts from Excel file"""
    wb = openpyxl.load_workbook(filename)
    ws = wb.active
    
    prompts = []
    for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True)):
        if any(row):
            prompts.append({
                'row_num': i + 2,
                'nomor': row[0],
                'kombinasi': row[1],
                'skema': row[2],
                'struktur': row[3],
                'teknik': row[4],
                'prompt': row[5],
                'sumber': row[6]
            })
    
    return prompts

def test_prompt(prompt_text):
    """Test a prompt and return token usage"""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "user", "content": prompt_text}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return {
            'success': True,
            'response': response.choices[0].message.content[:100] + '...',
            'input_tokens': response.usage.prompt_tokens,
            'output_tokens': response.usage.completion_tokens,
            'total_tokens': response.usage.prompt_tokens + response.usage.completion_tokens,
            'error': None
        }
    except Exception as e:
        return {
            'success': False,
            'response': '',
            'input_tokens': 0,
            'output_tokens': 0,
            'total_tokens': 0,
            'error': str(e)
        }

def main():
    print("Reading prompts from Excel...")
    prompts = read_excel_prompts('prompt engineer.xlsx')
    print(f"Found {len(prompts)} prompts\n")
    
    # Test each prompt
    results = []
    for i, p in enumerate(prompts, 1):
        print(f"Testing prompt {i}/{len(prompts)}: {p['teknik'][:30]}...")
        
        result = test_prompt(p['prompt'])
        
        test_result = {
            'row_num': p['row_num'],
            'kombinasi': p['kombinasi'],
            'skema': p['skema'],
            'struktur': p['struktur'],
            'teknik': p['teknik'],
            'input_tokens': result['input_tokens'],
            'output_tokens': result['output_tokens'],
            'total_tokens': result['total_tokens'],
            'success': result['success'],
            'error': result['error'],
            'response_preview': result['response']
        }
        
        results.append(test_result)
        
        print(f"  [OK] Input: {result['input_tokens']}, Output: {result['output_tokens']}, Total: {result['total_tokens']}")
        if result['error']:
            print(f"  [ERROR] Error: {result['error']}")
        print()
    
    # Write results back to Excel
    write_results_to_excel(prompts, results)
    
    # Print summary
    print_summary(results)

def write_results_to_excel(prompts, results):
    """Write test results back to Excel"""
    wb = openpyxl.load_workbook('prompt engineer.xlsx')
    ws = wb.active
    
    # Add header columns if not exist
    header_row = 1
    headers = ['Input Tokens', 'Output Tokens', 'Total Tokens', 'Response Preview', 'Status']
    start_col = 8  # Column H
    
    for col_num, header in enumerate(headers, start=start_col):
        ws.cell(row=header_row, column=col_num).value = header
        ws.cell(row=header_row, column=col_num).font = Font(bold=True, color="FFFFFF")
        ws.cell(row=header_row, column=col_num).fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    
    # Write results
    for i, result in enumerate(results, start=2):
        ws.cell(row=i, column=8).value = result['input_tokens']
        ws.cell(row=i, column=9).value = result['output_tokens']
        ws.cell(row=i, column=10).value = result['total_tokens']
        ws.cell(row=i, column=11).value = result['response_preview']
        ws.cell(row=i, column=12).value = "Success" if result['success'] else f"Error: {result['error']}"
        
        # Color code based on success
        if result['success']:
            fill_color = "C6EFCE"  # Green
            font_color = "006100"
        else:
            fill_color = "FFC7CE"  # Red
            font_color = "9C0006"
        
        for col in range(8, 13):
            ws.cell(row=i, column=col).fill = PatternFill(start_color=fill_color, end_color=fill_color, fill_type="solid")
            ws.cell(row=i, column=col).font = Font(color=font_color)
    
    # Auto-adjust column widths
    ws.column_dimensions['H'].width = 15
    ws.column_dimensions['I'].width = 15
    ws.column_dimensions['J'].width = 15
    ws.column_dimensions['K'].width = 40
    ws.column_dimensions['L'].width = 30
    
    wb.save('prompt engineer.xlsx')
    print("Results saved to Excel!")

def print_summary(results):
    """Print summary statistics"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    print(f"\nTotal Tests: {len(results)}")
    print(f"Successful: {len(successful)}")
    print(f"Failed: {len(failed)}")
    
    if successful:
        total_input = sum(r['input_tokens'] for r in successful)
        total_output = sum(r['output_tokens'] for r in successful)
        total_tokens = sum(r['total_tokens'] for r in successful)
        
        print(f"\nToken Statistics (Successful only):")
        print(f"  Total Input Tokens: {total_input}")
        print(f"  Total Output Tokens: {total_output}")
        print(f"  Total Tokens: {total_tokens}")
        print(f"  Average Input per prompt: {total_input/len(successful):.2f}")
        print(f"  Average Output per prompt: {total_output/len(successful):.2f}")
        
        print(f"\nToken Usage by Technique:")
        techniques = {}
        for r in successful:
            tech = r['teknik']
            if tech not in techniques:
                techniques[tech] = {'input': 0, 'output': 0, 'count': 0}
            techniques[tech]['input'] += r['input_tokens']
            techniques[tech]['output'] += r['output_tokens']
            techniques[tech]['count'] += 1
        
        for tech, stats in sorted(techniques.items()):
            print(f"  {tech}:")
            print(f"    Input: {stats['input']} ({stats['input']/stats['count']:.2f} avg)")
            print(f"    Output: {stats['output']} ({stats['output']/stats['count']:.2f} avg)")
            print(f"    Total: {stats['input'] + stats['output']}")
    
    if failed:
        print(f"\nFailed Tests:")
        for r in failed:
            print(f"  - {r['teknik']}: {r['error']}")

if __name__ == "__main__":
    main()
