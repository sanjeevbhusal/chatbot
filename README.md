The name of this project is AskMyDocs. As the name suggests, its a RAG (Retrieval Augmented Generation) based chatbot application. User can upload documents and ask questions against the documents. The application will use OpenAI model's to generate responses.


## Application UI
The major focus was to learn how to build a RAG application. I haven't stressed much about making the UI look the prettiest. However, the UI does look good enough and is responsibe across all devices. 

![Application UI](https://github.com/user-attachments/assets/26439b7d-01f8-4a3d-9a10-af8575d1c30b)


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




## Tech Stack

- LLM Framework: LangChain
- LLM Provider: OpenAI
- App Framework: Next.js 15
- Styling: TailwindCSS with Shadcn UI
- Database: SQLite hosted on Turso. 
- ORM:Drizzle ORM 
- Authentication: BetterAuth
- Document Storage: Cloudinary


## Application Working Details. 

User uploads a document to the application. The document is split into multiple small documents to make it easier to to a similarity search and feed into LLM. Embeddings is generated from all the splitted documents using OpenAI's embedding model (Eg: text-embedding-3-small). The embeddings are then stored in a database with proper relationship to the splitted documents and the original user supplied documents. 

When user asks a question, embedding for the question is generated using the same OpenAI model as above. Using the embeddings, we perform a similarity search to find the most relevant documents. A prompt is then created and passed to another OpenAI model (Eg: gpt-3.5-turbo). The prompt is created from question, documents, custom instructions and all the chat history for a conversation/thread. The response is then displayed to the user. 


## Important Note.

The code is not that clean/efficient. You might find some unused functions, multiple console logs, commented code etc in the codebase. My purpose of this project was to learn how to make a LLM powered application. This project isn't built with production in mind. 



## Local Setup

In order to run this application locally, you first need to have some environment variables set up. There is a example file (.env.example) in the root directory. Clone that file to create a .env file and fill in the values. 

- TURSO_DATABASE_URL
  - a database url that connectes to a sqlite instance hosted in turso

- TURSO_AUTH_TOKEN
  - the auth token from turso

- OPENAI_MODEL
  - the model you want to use for chat (not embeddings). Default value is "gpt-3.5-turbo". Ensure the model used is supported by LangChain.

- OPENAI_API_KEY
  - the api key from openai

- BETTER_AUTH_SECRET
  - a random string used to hash/encrypt sensitve data such as user passwords. can be any long random string. 

- BETTER_AUTH_URL
  - url where authentication server is running. Since authentication server is just part of this app and not a separate repo, it will be hosted on the same port as this app. Defaults to http://localhost:3000

- GOOGLE_CLIENT_ID
  - the id that uniquely identified your app. required for signin. 

- GOOGLE_CLIENT_SECRET
  - the client secret associated with your google app. required for signin.

- CLOUDINARY_URL
 - the url that uniquely identifes your project alongside authentication details. Required for document uploads


Once you have the environment variables set up, next step is to do your database migrations. You can run the following command to run all the migration files. migration files are prsent in drizzle/ folder. 

```bash
npx drizzle-kit migrate
```

Once you have done the migrations, you can run the app using the following command:

```bash
npm run dev
```
This will start a dev server on localhost:3000. 

If you want a UI to view/edit database, you can  run the following command. 

```bash
npx drizzle-kit studio
```

This will start a local database GUI on https://local.drizzle.studio/