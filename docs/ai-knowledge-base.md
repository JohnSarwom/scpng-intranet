# AI Knowledge Base Integration

This document explains how the AI Assistant in the AI Hub page utilizes local text files, specifically `CDA2015.txt`, as a knowledge base for generating responses.

## Overview

The system uses an **in-context learning** approach to provide the AI with specialized knowledge. Instead of relying on a complex vector database or external knowledge retrieval system, the content of the relevant legal act is directly injected into the AI's system prompt for a given session.

## Mechanism

The process can be broken down into the following steps:

1.  **File Loading**: The `CDA2015.txt` file, located in the `public/files/` directory, is imported directly into the `src/pages/AIHub.tsx` component as a raw text string. This is achieved using Vite's `?raw` import feature.

    ```javascript
    import cda2015PromptText from '/files/CDA2015.txt?raw';
    ```

2.  **AI Mode Definition**: The `AIHub.tsx` component defines several "AI Modes," each with a specific persona and system prompt. A dedicated mode, "CDA 2015 Expert," is created for interacting with the Central Depositories Act 2015.

3.  **Dynamic Prompt Construction**: When the "CDA 2015 Expert" mode is active, a detailed system prompt is constructed. This prompt includes:
    *   An instruction defining the AI's role (e.g., "You are an expert on the Central Depositories Act 2015").
    *   A clear directive to base all answers *only* on the provided text.
    *   The full, verbatim text of the `cda2015PromptText` variable, which holds the content of `CDA2015.txt`.

    Here is the code snippet that constructs the prompt:

    ```javascript
    {
      id: 'cda_2015_expert',
      title: 'CDA 2015 Expert',
      prompt: useKnowledgeBase 
        ? `You are an expert on the Central Depositories Act 2015... Here is the text of the Central Depositories Act 2015:\n\n${cda2015PromptText}`
        : `You are an expert on the Central Depositories Act 2015... as the specific knowledge base is currently disabled.`
    }
    ```

4.  **API Request**: When the user sends a message, the `handleSendChatMessage` function is triggered. It packages the user's message and the constructed system prompt (containing the CDA 2015 text) into a request body.

5.  **System Instruction**: The prompt is sent to the Google Gemini API via the `system_instruction` field in the request. This tells the AI to adhere to these instructions for the entire conversation, effectively using the provided text as its sole source of truth.

    ```javascript
    const requestBody: any = {
      contents: conversationHistory,
    };

    if (systemInstruction) {
      requestBody.system_instruction = systemInstruction;
    }

    // ...fetch request to Gemini API
    ```

## Conclusion

This method is an efficient way to ground the AI's responses in a specific body of knowledge without the overhead of more complex retrieval-augmented generation (RAG) systems. It ensures that when a user is interacting with an "Expert" mode, the answers are reliable, accurate, and directly tied to the source document. The `useKnowledgeBase` toggle provides a simple way to enable or disable this functionality for testing or comparison purposes.
