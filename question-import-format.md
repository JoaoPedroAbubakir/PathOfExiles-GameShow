# Question Pool Import Format

The import file should be a CSV file with the following columns:
- text: The question text
- answer: The correct answer
- imageUrl: (Optional) URL or path to an image hint

Example:
```csv
text,answer,imageUrl
"What is the capital of France?","Paris",
"Which element has the symbol 'Au'?","Gold","https://example.com/gold.jpg"
"What is 2+2?","4",
```

Notes:
- The file must be in CSV format with headers
- Text and answers can contain commas if properly quoted
- Image URL is optional
- Each question will be added to the question pool
