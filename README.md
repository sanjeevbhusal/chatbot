The name of this project is AskMyDocs. As the name suggests, its a RAG (Retrieval Augmented Generation) based chatbot application. User can upload documents and ask questions against the documents. The application will use OpenAI model's to generate responses.

## Features
- Authentication 
  - User can create account / log in using Google. 
- Document Upload: 
  - User can upload documents. The uploaded documents are stored in Cloudinary. 
- Document View:
  - User can view the uploaded documents. The documents are rendered in the application itself. 
- Chat History:
  - User can create mutliple chat histories. Each chat history resets the conversation.
- Answer Sources:
  - Each LLM response comes with the sources the answer was generated from. User can click on the source to view that specific part of the document.
- Document Filtering:
  - User can configure which document to search from for each query.
- Embeddings:
  - The uploaded documents embeddings are generated using OpenAI's embedding model and are instantly ready to be searchable.


## Application UI
The major focus was to learn how to build a RAG application. I haven't stressed much about making the UI look the prettiest. However, the UI does look good enough and is responsibe across all devices. 

![Application UI](https://github.com/user-attachments/assets/26439b7d-01f8-4a3d-9a10-af8575d1c30b)




## Tech Stack

- LLM Framework: LangChain
- LLM Provider: OpenAI
- App Framework: Next.js 15
- Styling: TailwindCSS with Shadcn UI
- Database: SQLite/LibSQl hosted on Turso. 
- ORM:Drizzle ORM 
- Authentication: BetterAuth
- Document Storage: Cloudinary

