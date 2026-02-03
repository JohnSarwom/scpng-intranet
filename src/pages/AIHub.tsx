import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare, Bot, Lightbulb, FileText, Search, Send, Upload, Loader2, Settings, Maximize, Minimize,
  ClipboardCopy, Check, Trash2, Link as LinkIcon, ExternalLink, BookOpen
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import KnowledgeUploadModal from '@/components/ai-hub/KnowledgeUploadModal';
import QuestionLibrarySidebar from '@/components/ai-hub/QuestionLibrarySidebar';
import { useUIRoles } from '@/hooks/useUIRoles';
import { cn } from '@/lib/utils';
import { supabase, logger, GLOBAL_SETTINGS_ID } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useMsal } from '@azure/msal-react';
import { useMicrosoftGraph, type GraphContextType } from '@/hooks/useMicrosoftGraph';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import scpngDocAnalystPromptText from '@/prompts/scpngDocAnalystPrompt.txt';
import cma2015PromptText from '/files/CMA2015.txt?raw';
import cda2015PromptText from '/files/CDA2015.txt?raw';
import sa1997PromptText from '/files/SA1997.txt?raw';
import sca2015PromptText from '/files/SCA2015.txt?raw';

const KB_SHAREPOINT_SITEPATH = "/sites/scpngintranet";
const KB_SHAREPOINT_LIBRARY_NAME = "SCPNG Docuements";
const KB_SHAREPOINT_TARGET_FOLDER = "KnowledgeBaseDocuments";

const SHARED_LEGAL_EXPERT_INSTRUCTIONS = `
### MANDATORY RESPONSE INSTRUCTIONS (OFFICIAL LAYOUT):
1. **AUTHENTICITY IS PARAMOUNT**: You MUST provide a direct, word-for-word quote from the relevant Act.
2. **REQUIRED STRUCTURE (MANDATORY BLANK LINES)**:
   - **Lead-in**: Start with "According to the **[Act Name]**, **Section [X]** states:"
   - **The Visual Quote**: Use the \`> [!NOTE]\` syntax.
   - **CRITICAL: USE BLANK LINES**: You MUST use a completely BLANK LINE (Double Newline) between the Section Title, Subsection (1), Subsection (2), and any Paragraphs (a), (b). If you don't use blank lines, the formatting will fail.
   - **Indentation hierarchy**:
     - **Section Title**: **BOLD AND ALL CAPS** on its own line.
     - **Subsections (1), (2)**: New line, starting with (1), (2) etc.
     - **Paragraphs (a), (b)**: New line, starting with (a), (b) etc.
     - **Penalty**: Lead with "**Penalty:**" on a new line.
   - **Example of REQUIRED raw output**:
     > [!NOTE]
     > **95. OBSTRUCTING PERSON ACTING UNDER THIS PART.**
     >
     > (1) A person shall not engage in conduct that results in...
     >
     > (a) in the exercise of a power...
     >
     > **Penalty:** A fine not exceeding K10,000,000.00...
3. **EXPERT ANALYSIS**: Provide your interpretation below the quote box.
4. **RICH FORMATTING**: **Bold** all Section numbers and *Italicize* obligations (*shall*, *must*).

5. **INTERACTIVE FOLLOW-UPS (MANDATORY)**: At the VERY end of your response, you MUST provide 3 relevant follow-up questions.
   Format: <followups>Question 1|Question 2|Question 3</followups>
`;

// Define AI Modes based on a toggle
const getAiModes = (useKnowledgeBase: boolean) => [
  {
    id: 'general',
    title: 'General Purpose AI',
    disabled: true,
    prompt: "You are a helpful, neutral general-purpose assistant capable of summarizing, explaining, and analyzing a wide range of topics and documents for a non-expert audience. Avoid legal interpretations or policy enforcement advice."
  },
  {
    id: 'doc_analyst',
    title: 'SCPNG Document Analyst',
    disabled: true,
    prompt: scpngDocAnalystPromptText
  },
  {
    id: 'cma_2015_expert',
    title: 'CMA 2015 Expert',
    prompt: useKnowledgeBase
      ? `You are an expert on the Capital Market Act 2015. Your primary goal is to answer questions and provide information based on the text of the Act provided below.\n\nHere is the text of the Capital Market Act 2015:\n\n${cma2015PromptText}\n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
      : `You are an expert on the Capital Market Act 2015. Please answer questions based on your general knowledge of the Act, as the specific knowledge base is currently disabled. \n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
  },
  {
    id: 'cda_2015_expert',
    title: 'CDA 2015 Expert',
    prompt: useKnowledgeBase
      ? `You are an expert on the Central Depositories Act 2015. Your primary goal is to answer questions and provide information based on the text of the Act provided below.\n\nHere is the text of the Central Depositories Act 2015:\n\n${cda2015PromptText}\n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
      : `You are an expert on the Central Depositories Act 2015. Please answer questions based on your general knowledge of the Act, as the specific knowledge base is currently disabled. \n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
  },
  {
    id: 'sa_1997_expert',
    title: 'SA 1997 Expert',
    prompt: useKnowledgeBase
      ? `You are an expert on the Securities Act 1997. Your primary goal is to answer questions and provide information based on the text of the Act provided below.\n\nHere is the text of the Securities Act 1997:\n\n${sa1997PromptText}\n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
      : `You are an expert on the Securities Act 1997. Please answer questions based on your general knowledge of the Act, as the specific knowledge base is currently disabled. \n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
  },
  {
    id: 'sca_2015_expert',
    title: 'SCA 2015 Expert',
    prompt: useKnowledgeBase
      ? `You are an expert on the Securities Commission Act 2015. Your primary goal is to answer questions and provide information based on the text of the Act provided below.\n\nHere is the text of the Securities Commission Act 2015:\n\n${sca2015PromptText}\n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
      : `You are an expert on the Securities Commission Act 2015. Your primary goal is to answer questions and provide information based on your knowledge of the Act. \n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
  },
  {
    id: 'merged_acts_expert',
    title: 'All Acts Expert',
    prompt: useKnowledgeBase
      ? `You are an expert on the Capital Market Act 2015, the Central Depositories Act 2015, the Securities Act 1997, and the Securities Commission Act 2015. Your primary goal is to answer questions and provide information based on the text of these Acts provided below.\n\nHere are the texts of the Acts:\n\nCapital Market Act 2015:\n${cma2015PromptText}\n\nCentral Depositories Act 2015:\n${cda2015PromptText}\n\nSecurities Act 1997:\n${sa1997PromptText}\n\nSecurities Commission Act 2015:\n${sca2015PromptText}\n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
      : `You are an expert on the Capital Market Act 2015, the Central Depositories Act 2015, the Securities Act 1997, and the Securities Commission Act 2015. Please answer questions based on your general knowledge of these Acts, as the specific knowledge base is currently disabled. \n\n${SHARED_LEGAL_EXPERT_INSTRUCTIONS}`
  }
];

// Define the new ChatMessage type
interface ChatMessage {
  id: string; // For unique key prop and managing individual animations
  sender: 'user' | 'ai';
  text: string; // For user messages, this is the full text. For AI, this is the currently displayed animated text.
  fullText?: string; // For AI messages, the complete response from the API.
  isTyping?: boolean; // True if this AI message is currently being typed out.
  timestamp: Date; // To help order messages if needed, though id should suffice for keys
  followUpQuestions?: string[]; // Optional follow-up questions for AI messages
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string; // To differentiate between actual file uploads and simple links
  created_at: string;
}

const AIHub = () => {
  const [query, setQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      sender: 'ai',
      text: "Hello! I'm your SCPNG AI Assistant. How can I help you today?",
      isTyping: false,
      timestamp: new Date(),
    }
  ]);
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedKnowledgeArea, setSelectedKnowledgeArea] = useState<string | null>(null);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  const aiModes = getAiModes(useKnowledgeBase);
  const [currentAiModeId, setCurrentAiModeId] = useState<string>('cma_2015_expert'); // State for current AI mode
  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialSearchHandled, setIsInitialSearchHandled] = useState(false);
  const [isChatFullScreen, setIsChatFullScreen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null); // For copy feedback
  const [isClearChatDialogOpen, setIsClearChatDialogOpen] = useState(false);

  const [uploadedSharePointFiles, setUploadedSharePointFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [loadFilesError, setLoadFilesError] = useState<string | null>(null);

  const { isSystemAdmin } = useUIRoles();
  const { user, isLoading: isAuthLoading } = useSupabaseAuth();
  const { accounts, inProgress: msalInProgress } = useMsal();
  const graphContext = useMicrosoftGraph() as GraphContextType;

  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testMessageType, setTestMessageType] = useState<'success' | 'error' | ''>('');
  const [saveStatus, setSaveStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);

  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const lastMessage = chatMessages[chatMessages.length - 1];
    if (lastMessage && lastMessage.sender === 'ai' && lastMessage.isTyping && lastMessage.fullText) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      const typeNextChar = (charIndex: number) => {
        if (charIndex < lastMessage.fullText!.length) {
          setChatMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === lastMessage.id
                ? { ...msg, text: lastMessage.fullText!.substring(0, charIndex + 1) }
                : msg
            )
          );
          scrollToBottom(); // Scroll as text types
          typingTimeoutRef.current = setTimeout(() => typeNextChar(charIndex + 1), 25);
        } else {
          setChatMessages(prevMessages =>
            prevMessages.map(msg => (msg.id === lastMessage.id ? { ...msg, isTyping: false } : msg))
          );
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          scrollToBottom(); // Ensure scrolled to end after typing finishes
        }
      };
      const currentDisplayTextLength = lastMessage.text?.length || 0;
      if (currentDisplayTextLength < lastMessage.fullText.length) {
        typeNextChar(currentDisplayTextLength);
      } else {
        setChatMessages(prevMessages =>
          prevMessages.map(msg => (msg.id === lastMessage.id ? { ...msg, isTyping: false } : msg))
        );
      }
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages]); // Rerun when a new AI message starts typing or chatMessages array ref changes

  useEffect(() => {
    // More robust scroll to bottom, especially after images or content that might change height
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50); // A small delay can help if content is still rendering/reflowing
    return () => clearTimeout(timer);
  }, [chatMessages]);

  useEffect(() => {
    const fetchAiSettings = async () => {
      if (isAuthLoading || msalInProgress !== 'none') {
        // logger.info('[AIHub] Waiting for auth/MSAL to complete before fetching AI settings.');
        setIsConfigLoading(true);
        return;
      }
      setIsConfigLoading(true);
      try {
        const { data, error } = await supabase
          .from('news_api_settings')
          .select('api_key, api_endpoint, last_updated_by')
          .eq('id', GLOBAL_SETTINGS_ID)
          .single();

        if (error && error.code !== 'PGRST116') {
          logger.error('[AIHub] Error fetching AI settings:', error);
          setSaveStatus(`Error loading AI settings: ${error.message}`);
          setChatMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'ai',
            text: "Error loading AI Assistant configuration.",
            isTyping: false,
            timestamp: new Date()
          }]);
        } else if (data) {
          setApiKey(data.api_key || '');
          setApiEndpoint(data.api_endpoint || '');
          setLastUpdatedBy(data.last_updated_by);
          // logger.info('[AIHub] AI settings loaded successfully.');
        } else {
          // logger.warn('[AIHub] No AI settings found (id=1). Admins should save to initialize.');
          setChatMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'ai',
            text: "AI Assistant not fully configured. Please set API Key and Endpoint in AI Configuration.",
            isTyping: false,
            timestamp: new Date()
          }]);
        }
      } catch (err: any) {
        logger.error('[AIHub] Exception fetching AI settings:', err);
        setSaveStatus('An unexpected error occurred while loading AI settings.');
        setChatMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'ai',
          text: "Error loading AI Assistant configuration.",
          isTyping: false,
          timestamp: new Date()
        }]);
      }
      setIsConfigLoading(false);
    };
    fetchAiSettings();
  }, [isAuthLoading, msalInProgress]);

  // Handle auto-start search from query parameters
  useEffect(() => {
    if (isAuthLoading || msalInProgress !== 'none' || isConfigLoading || isInitialSearchHandled || !apiKey || !apiEndpoint) {
      return;
    }

    const qParam = searchParams.get('q');
    const modeParam = searchParams.get('mode');

    if (qParam) {
      // logger.info(`[AIHub] Handling auto-search: "${qParam}" with mode: ${modeParam}`);
      if (modeParam && aiModes.some(m => m.id === modeParam)) {
        setCurrentAiModeId(modeParam);
      }

      // We need to wait a tiny bit for the mode state to potentially update if needed,
      // though handleSendChatMessage uses the state. 
      // To be safe and ensure the search actually triggers, we can call it manually.
      // But query state is also needed.
      setQuery(qParam);
      setIsInitialSearchHandled(true);

      // Delay slightly to allow state to settle
      setTimeout(() => {
        const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (btn) btn.click();
      }, 500);

      // Clear params to avoid repeat on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      newParams.delete('mode');
      setSearchParams(newParams, { replace: true });
    } else {
      setIsInitialSearchHandled(true);
    }
  }, [searchParams, isAuthLoading, msalInProgress, isConfigLoading, apiKey, apiEndpoint, isInitialSearchHandled, aiModes, setSearchParams]);

  const handleSaveAiSettings = async () => {
    setIsSaving(true);
    setSaveStatus('Saving AI settings...');
    const settingsData = {
      id: GLOBAL_SETTINGS_ID,
      api_key: apiKey,
      api_endpoint: apiEndpoint,
      last_updated_by: user ? user.id : null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('news_api_settings').upsert(settingsData, { onConflict: 'id' });
      if (error) {
        logger.error('[AIHub] Error saving AI settings (Supabase):', error);
        setSaveStatus(`Error saving settings: ${error.message}.`);
      } else {
        setSaveStatus('AI settings saved successfully!');
        setLastUpdatedBy(user ? user.id : null);
        // logger.info('[AIHub] AI settings saved.', { adminMsalName: accounts[0]?.name, supabaseUserId: user?.id });
      }
    } catch (err) {
      logger.error('[AIHub] Exception saving AI settings:', err);
      setSaveStatus('An unexpected error occurred while saving AI settings.');
    }
    setIsSaving(false);
    setTimeout(() => setSaveStatus(''), 5000);
  };

  const handleTestAiConnection = async () => {
    setIsTesting(true);
    setTestMessage('');
    setTestMessageType('');

    if (!apiEndpoint || !apiKey) {
      setTestMessage('API Endpoint and API Key must be provided to test.');
      setTestMessageType('error');
      setIsTesting(false);
      return;
    }

    if (apiEndpoint.includes('generativelanguage.googleapis.com')) {
      const fullGeminiEndpoint = `${apiEndpoint}?key=${apiKey}`;
      const testPrompt = "Test: Please respond with 'Hello World!'";
      const requestBody = { contents: [{ parts: [{ text: testPrompt }] }] };

      try {
        // logger.info('[AIHub] Testing Gemini API connection...', { endpoint: apiEndpoint.split('?')[0] });
        const response = await fetch(fullGeminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const responseData = await response.json();
        if (!response.ok) {
          const errorDetail = responseData?.error?.message || JSON.stringify(responseData);
          throw new Error(`API request failed with status ${response.status}: ${errorDetail}`);
        }
        if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
          const aiResponse = responseData.candidates[0].content.parts[0].text;
          setTestMessage(`Connection successful! AI says: "${aiResponse}"`);
          setTestMessageType('success');
          // logger.info('[AIHub] Gemini API test successful.', { response: aiResponse });
        } else {
          throw new Error('Test response format not recognized or content missing.');
        }
      } catch (error: any) {
        logger.error('[AIHub] Gemini API test failed:', error);
        setTestMessage(`Connection failed: ${error.message}`);
        setTestMessageType('error');
      }
    } else {
      setTestMessage('Automated test for this endpoint type is not currently supported.');
      setTestMessageType('error');
      // logger.warn('[AIHub] API test skipped: Endpoint does not appear to be a Gemini endpoint.', { endpoint: apiEndpoint });
    }
    setIsTesting(false);
  };

  const handleSendChatMessage = async (e?: React.FormEvent, manualMessage?: string) => {
    e?.preventDefault();
    const messageToSend = manualMessage || query.trim(); // Use manual message if provided, else use query state
    if (!messageToSend) return;

    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      text: messageToSend,
      timestamp: new Date(),
    };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
    setQuery('');
    setIsSendingChatMessage(true);

    if (!apiEndpoint || !apiKey) {
      const aiErrorMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        text: 'AI is not configured. Please set API Key and Endpoint.',
        isTyping: false,
        timestamp: new Date(),
      };
      setChatMessages(prevMessages => [...prevMessages, aiErrorMessage]);
      setIsSendingChatMessage(false);
      return;
    }

    const currentMode = aiModes.find(mode => mode.id === currentAiModeId);
    const systemInstruction = currentMode ? { parts: [{ text: currentMode.prompt }] } : undefined;

    // Use Supabase Edge Function instead of direct client-side fetch
    const conversationHistory = chatMessages
      .filter((msg, index) => index !== 0)
      .filter(msg => msg.sender === 'user' || (msg.sender === 'ai' && !msg.isTyping))
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.fullText || msg.text }],
      }));

    conversationHistory.push({
      role: 'user',
      parts: [{ text: messageToSend }],
    });

    const requestBody: any = {
      contents: conversationHistory,
    };

    if (systemInstruction) {
      requestBody.system_instruction = systemInstruction;
    }

    try {
      // logger.info('[AIHub Chat] Sending message to ai-chat Edge Function...', { mode: currentMode?.title });
      const { data: responseData, error: invokeError } = await supabase.functions.invoke('ai-chat', {
        body: requestBody
      });

      if (invokeError) {
        throw new Error(`Edge Function invocation failed: ${invokeError.message} (Status: ${invokeError.code})`);
      }

      if (responseData.error) {
        throw new Error(`AI Service Error: ${responseData.error}`);
      }

      if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
        let aiResponseText = responseData.candidates[0].content.parts[0].text;

        // Parse follow-up questions
        let followUpQuestions: string[] = [];
        const followUpMatch = aiResponseText.match(/<followups>(.*?)<\/followups>/);
        if (followUpMatch) {
          followUpQuestions = followUpMatch[1].split('|').map(q => q.trim());
          // Remove tags from the text
          aiResponseText = aiResponseText.replace(/<followups>.*?<\/followups>/, '').trim();
        }

        const newAiMessage: ChatMessage = {
          id: uuidv4(),
          sender: 'ai',
          text: '',
          fullText: aiResponseText,
          isTyping: true,
          timestamp: new Date(),
          followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
        };
        setChatMessages(prevMessages => [...prevMessages, newAiMessage]);
      } else {
        throw new Error('Chat response format not recognized or content missing.');
      }
    } catch (error: any) {
      logger.error('[AIHub Chat] AI Request failed:', error);
      const aiErrorMessage: ChatMessage = {
        id: uuidv4(),
        sender: 'ai',
        text: `Error: ${error.message}`,
        isTyping: false,
        timestamp: new Date(),
      };
      setChatMessages(prevMessages => [...prevMessages, aiErrorMessage]);
    }

    setIsSendingChatMessage(false);
  };

  const handleFollowUpClick = (question: string) => {
    setQuery(question);
    // Call handleSendChatMessage immediately with the question string
    handleSendChatMessage(undefined, question);
  };

  const handleKnowledgeUpload = async (
    category: string | null,
    title: string,
    description: string,
    files: FileList | null,
    links: string[]
  ) => {
    if (!category) {
      // logger.warn('[AIHub] Knowledge upload attempted without a category (for AI Hub organization).');
      alert('Category is required for knowledge upload (for AI Hub organization).');
      return;
    }
    if (!title.trim()) {
      alert('Title is required for knowledge upload.');
      return;
    }
    if ((!files || files.length === 0) && links.length === 0) {
      alert('Please provide at least one file or link to upload.');
      return;
    }

    // logger.info(`[AIHub] Starting knowledge upload for AI Hub category: ${category}`, { title, description, filesCount: files?.length, linksCount: links.length });
    setIsUploadModalOpen(false);

    const uploadPromises: Promise<any>[] = [];

    if (files && files.length > 0) {
      if (!graphContext.uploadBinaryFileToSharePoint) {
        logger.error('[AIHub] SharePoint upload function is not available. Check useMicrosoftGraph hook.');
        alert('Error: SharePoint upload functionality is not available.');
        return;
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uniqueFileName = `${uuidv4()}-${file.name}`;

        const uploadPromise = graphContext.uploadBinaryFileToSharePoint(
          file,
          uniqueFileName,
          KB_SHAREPOINT_SITEPATH,
          KB_SHAREPOINT_LIBRARY_NAME,
          KB_SHAREPOINT_TARGET_FOLDER
        ).then(sharepointUrl => {
          if (sharepointUrl) {
            // logger.success(`[AIHub] File ${file.name} uploaded to SharePoint: ${sharepointUrl}`);
            const docDataForDocumentsTable = {
              name: title || file.name,
              type: file.type || 'application/octet-stream',
              size: file.size.toString(),
              owner: user?.id ? user.id.toString() : 'unknown',
              url: sharepointUrl,
              unit_id: null,
              shared: false,
            };
            return supabase.from('documents').insert(docDataForDocumentsTable);
          } else {
            throw new Error(`Failed to upload ${file.name} to SharePoint. ${graphContext.lastError || ''}`);
          }
        });
        uploadPromises.push(uploadPromise);
      }
    }

    if (links && links.length > 0) {
      links.forEach(link => {
        if (link.trim()) {
          const docDataForDocumentsTable = {
            name: title,
            type: 'link',
            size: '0',
            owner: user?.id ? user.id.toString() : 'unknown',
            url: link,
            unit_id: null,
            shared: false,
          };
          uploadPromises.push(
            new Promise(async (resolve, reject) => {
              try {
                const response = await supabase.from('documents').insert(docDataForDocumentsTable);
                if (response.error) {
                  logger.error('[AIHub] Error inserting link to documents table:', { link, error: response.error });
                  reject(response.error);
                } else {
                  resolve(response);
                }
              } catch (error) {
                logger.error('[AIHub] Exception inserting link to documents table:', { link, error });
                reject(error);
              }
            })
          );
        }
      });
    }

    try {
      const results = await Promise.allSettled(uploadPromises);
      let successCount = 0;
      let errorCount = 0;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const supaResult = result.value as any;
          if (supaResult && supaResult.error) {
            logger.error(`[AIHub] Error saving item to 'documents' table (Index ${index}):`, supaResult.error);
            errorCount++;
          } else {
            // logger.success(`[AIHub] Item (Index ${index}) processed and saved to 'documents' table.`);
            successCount++;
          }
        } else {
          logger.error(`[AIHub] Error processing item (Index ${index}):`, result.reason);
          errorCount++;
        }
      });

      if (errorCount > 0) {
        alert(`Knowledge upload partially failed. ${successCount} items succeeded, ${errorCount} items failed. Check console for details.`);
      } else {
        alert(`Successfully uploaded and saved ${successCount} knowledge items to the documents table!`);
      }

    } catch (overallError) {
      logger.error('[AIHub] Critical error during batch knowledge upload to documents table:', overallError);
      alert('An unexpected error occurred during the upload process. Check console for details.');
    } finally {
    }
  };

  const openUploadModalForArea = (areaTitle: string) => {
    setSelectedKnowledgeArea(areaTitle);
    setIsUploadModalOpen(true);
  };

  const knowledgeAreas = [
    {
      title: 'Organizational Policies',
      description: 'Access and query all organizational policies and procedures',
      icon: FileText
    },
    {
      title: 'Technical Knowledge Base',
      description: 'Technical documentation and troubleshooting guides',
      icon: Lightbulb
    },
    {
      title: 'Project Management',
      description: 'Best practices and organizational standards for projects',
      icon: MessageSquare
    },
    {
      title: 'Employee Resources',
      description: 'HR information, benefits, and professional development',
      icon: Search
    },
  ];

  const popularQuestionsByMode: Record<string, string[]> = {
    general: [
      "Summarize the main points of the attached document.",
      "Explain the concept of 'due diligence' in simple terms.",
      "What are the key differences between a stock and a bond?",
      "Draft an email to the team about the upcoming project deadline."
    ],
    doc_analyst: [
      "Analyze the attached financial report for Q3.",
      "What are the main risks identified in this compliance document?",
      "Extract all the key dates and deadlines from this project plan.",
      "Compare the attached two versions of the contract and highlight the differences."
    ],

    cma_2015_expert: [
      "What constitutes 'insider trading' under the Capital Market Act 2015?",
      "Explain the licensing requirements for a fund manager.",
      "What are the powers of the Securities Commission under the Act?",
      "Summarize the regulations regarding public offerings."
    ],
    cda_2015_expert: [
      "What is the role of a central depository?",
      "Explain the process of securities transfer under the CDA 2015.",
      "What are the requirements for a depository participant?",
      "Describe the provisions related to the protection of securities."
    ],
    sa_1997_expert: [
      "What are the functions of the Securities Commission under the SA 1997?",
      "Explain the concept of 'material information' as defined in the Act.",
      "What are the penalties for insider trading according to the SA 1997?",
      "Describe the requirements for a prospectus under the Securities Act 1997."
    ],
    sca_2015_expert: [
      "What are the general powers of the Securities Commission under the SCA 2015?",
      "Explain the governance structure of the Securities Commission.",
      "What are the enforcement mechanisms available to the Commission?",
      "Describe the role of the Securities Commission in regulating the capital market."
    ],
    merged_acts_expert: [
      "How does the 'public interest' objective in SCA s. 7 conflict with specific market efficiency mandates in CMA s. 13?",
      "Could the Minister's power to appoint one-third of exchange directors (CMA s. 12) undermine the 'independent' regulatory facade of SCA s. 6?",
      "How does the 'exempted stock market' status for BPNG-operated systems (CMA s. 8(4)) create a shadow capital market?",
      "Compare the definitions of 'securities' across the CMA 2015, CDA 2015, SA 1997, and SCA 2015."
    ]
  };

  const uiIsActuallyLoading = isAuthLoading || msalInProgress !== 'none' || isConfigLoading;
  const canEditSettings = !uiIsActuallyLoading && isSystemAdmin;

  const handleClearChat = () => {
    setChatMessages([
      {
        id: uuidv4(),
        sender: 'ai',
        text: "Hello! I'm your SCPNG AI Assistant. How can I help you today?", // Use the constant if available elsewhere
        isTyping: false,
        timestamp: new Date(),
      }
    ]);
    setQuery(''); // Clear input field as well
    setIsClearChatDialogOpen(false);
  };

  const handleCopyMessage = (textToCopy: string, messageId: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      logger.error('Failed to copy message:', err);
    });
  };

  const handleLibraryQuestionSelect = (question: string, mode?: string) => {
    if (!apiKey || !apiEndpoint) {
      alert("AI is not configured. Please contact an admin.");
      return;
    }
    // Automatically set mode for this library, default to CDA if not provided
    setCurrentAiModeId(mode || 'cda_2015_expert');
    setQuery(question);

    // Smooth scroll to chat if on mobile
    const chatElement = document.getElementById('ai-assistant-card');
    if (chatElement && window.innerWidth < 1024) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
    }

    // Trigger search after a brief delay to ensure mode state is updated
    setTimeout(() => {
      handleSendChatMessage(undefined, question);
    }, 300);
  };

  // useEffect to fetch uploaded files
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      if (!user) {
        setIsLoadingFiles(false);
        // Or setUploadedSharePointFiles([]) if you only want to show files when logged in
        return;
      }
      setIsLoadingFiles(true);
      setLoadFilesError(null);
      try {
        const { data, error } = await supabase
          .from('documents') // Your Supabase table name for documents
          .select('id, name, url, type, created_at')
          // .eq('owner', user.id) // Uncomment to filter by current user
          .order('created_at', { ascending: false })
          .limit(10); // Limit for now, consider pagination later

        if (error) {
          throw error;
        }
        if (data) {
          setUploadedSharePointFiles(data as UploadedFile[]);
        }
      } catch (error: any) {
        logger.error('[AIHub] Error fetching uploaded documents:', error);
        setLoadFilesError('Failed to load uploaded documents. Please try again later.');
      } finally {
        setIsLoadingFiles(false);
      }
    };

    // Fetch files when the component mounts or user changes
    // Avoid fetching if auth is still loading to ensure user.id is available
    if (!isAuthLoading) {
      fetchUploadedFiles();
    }
  }, [user, isAuthLoading]);

  // Helper function to render the AI Chat Interface
  const renderAIChatInterface = (isFullScreenInstance: boolean) => {
    const initialGreetingText = "Hello! I'm your SCPNG AI Assistant. How can I help you today?";
    const shouldShowPlaceholder =
      chatMessages.length === 1 &&
      chatMessages[0].sender === 'ai' &&
      chatMessages[0].text === initialGreetingText &&
      !chatMessages[0].isTyping;

    return (
      <Card id="ai-assistant-card" className={cn(
        "flex flex-col h-full",
        isFullScreenInstance
          ? "w-full rounded-none border-none shadow-none"
          : "mb-6"
      )}>
        <CardHeader className={cn(isFullScreenInstance && "border-b", "py-3 px-4")}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {isFullScreenInstance && (
                <img src="/images/SCPNG Original Logo.png" alt="SCPNG Logo" className="h-8 w-auto" />
              )}
              <CardTitle className="flex items-center">
                {!isFullScreenInstance && <Bot className="mr-2 text-intranet-primary" size={20} />}
                AI Assistant
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsClearChatDialogOpen(true)} className="h-8 w-8" title="Clear chat">
                <Trash2 size={16} />
              </Button>
              {(currentAiModeId === 'cma_2015_expert' || currentAiModeId === 'cda_2015_expert') && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="knowledge-base-toggle"
                    checked={useKnowledgeBase}
                    onCheckedChange={setUseKnowledgeBase}
                    disabled={isFullScreenInstance}
                  />
                  <Label htmlFor="knowledge-base-toggle" className="text-xs">Use KB</Label>
                </div>
              )}
              <Select value={currentAiModeId} onValueChange={setCurrentAiModeId} disabled={isFullScreenInstance}>
                <SelectTrigger className="w-[180px] sm:w-[200px] text-xs h-8">
                  <Settings className="mr-1 h-3 w-3" /> <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  {aiModes.map(mode => (
                    <SelectItem key={mode.id} value={mode.id} className="text-xs" disabled={(mode as any).disabled}>
                      {mode.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => setIsChatFullScreen(!isChatFullScreen)} className="h-8 w-8" title={isChatFullScreen ? "Exit full screen" : "Enter full screen"}>
                {isChatFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </Button>
            </div>
          </div>
          {!isFullScreenInstance && (
            <CardDescription className="mt-2">
              Ask questions and get intelligent responses. Current mode: <span className="font-semibold">{aiModes.find(m => m.id === currentAiModeId)?.title || 'Unknown'}</span>.
              {isSystemAdmin && " Configure API settings below."}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className={cn("flex-1 flex flex-col overflow-hidden", isFullScreenInstance ? "p-4 lg:p-6" : "p-4")}>
          <div
            ref={messagesContainerRef}
            className={cn(
              "flex-1 overflow-y-auto mb-4",
              isFullScreenInstance ? "bg-transparent" : "bg-gray-50 rounded-lg", // Keep rounded-lg for normal view if it has bg-gray-50
              !isFullScreenInstance && "p-4" // Apply padding for normal view only if not using placeholder
            )}
          >
            {shouldShowPlaceholder ? (
              <div className="flex flex-col items-center justify-center h-full">
                <img src="/images/SCPNG Original Logo.png" alt="SCPNG Logo" className="w-24 h-24 mb-4" />
                <h2 className={cn("font-semibold text-gray-600 mb-2", isFullScreenInstance ? "text-xl" : "text-lg")}>
                  What can I help with?
                </h2>
                <div className={cn(
                  "max-w-md text-center px-4 py-3 rounded-lg border border-amber-200 bg-amber-50/50 text-amber-800 text-xs shadow-sm backdrop-blur-sm animate-in fade-in duration-700",
                  isFullScreenInstance ? "mt-4" : "mt-2"
                )}>
                  <p className="leading-relaxed">
                    <span className="font-bold uppercase tracking-wider block mb-1">AI Disclaimer</span>
                    This assistant provides AI-calculated insights based on legislative acts. It is <strong>not</strong> a substitute for professional legal advice. You must always cross-check and verify information against the official Acts and conduct your own research to confirm accuracy.
                  </p>
                </div>
              </div>
            ) : (
              chatMessages.map((message) => (
                <React.Fragment key={message.id}>
                  <div
                    className={cn(
                      "mb-3 flex",
                      message.sender === 'user' ? 'justify-end' : 'justify-start',
                      isFullScreenInstance && "max-w-3xl mx-auto w-full px-2" // Apply this only in FS for actual messages
                    )}
                  >
                    <div
                      className={`inline-block rounded-lg p-3 max-w-[80%] break-words relative group ${message.sender === 'user'
                        ? 'bg-intranet-primary text-white'
                        : isFullScreenInstance ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white border border-gray-200'
                        }`}
                    >
                      {message.sender === 'ai' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ node, ...props }) => {
                                const children = React.Children.toArray(props.children);
                                const firstChild = children[0];
                                let additionalClasses = "";

                                if (typeof firstChild === 'string') {
                                  const trimmed = firstChild.trim();
                                  if (/^\(\d+\)/.test(trimmed)) {
                                    additionalClasses = "ml-4 pl-2 border-l border-transparent";
                                  } else if (/^\([a-z]\)/.test(trimmed)) {
                                    additionalClasses = "ml-8 pl-2 border-l border-transparent";
                                  }
                                }

                                return <p className={cn("mb-2 last:mb-0", additionalClasses)} {...props} />;
                              },
                              ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              blockquote: ({ node, ...props }) => {
                                // Check if children contain [!NOTE]
                                const children = React.Children.toArray(props.children);
                                let isNote = false;

                                const stripNote = (child: any): any => {
                                  if (typeof child === 'string') {
                                    if (child.includes('[!NOTE]')) {
                                      isNote = true;
                                      return child.replace('[!NOTE]', '').trim();
                                    }
                                    return child;
                                  }
                                  if (React.isValidElement(child)) {
                                    const childProps = child.props as any;
                                    if (childProps.children) {
                                      return React.cloneElement(child, {
                                        ...childProps,
                                        children: React.Children.map(childProps.children, stripNote)
                                      });
                                    }
                                  }
                                  return child;
                                };

                                const newChildren = children.map(stripNote);

                                return (
                                  <blockquote
                                    className={cn(
                                      "border-l-4 pl-4 py-2 my-4 italic rounded-r-md whitespace-pre-wrap",
                                      isNote
                                        ? "bg-blue-50/50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 dark:border-blue-400 font-medium"
                                        : "border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50"
                                    )}
                                    {...props}
                                  >
                                    {newChildren}
                                  </blockquote>
                                );
                              },
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        message.text
                      )}
                      {message.sender === 'ai' && message.isTyping && (
                        <span className="ai-cursor"></span>
                      )}
                      {message.sender === 'ai' && !message.isTyping && message.text && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-300/50 hover:bg-gray-400/70 dark:bg-gray-600/50 dark:hover:bg-gray-500/70 p-1 rounded-full"
                          onClick={() => handleCopyMessage(message.fullText || message.text, message.id)}
                          title="Copy response"
                        >
                          {copiedMessageId === message.id ? <Check size={14} className="text-green-600" /> : <ClipboardCopy size={14} className="text-gray-600 dark:text-gray-300" />}
                        </Button>
                      )}
                    </div>
                  </div>
                  {
                    message.sender === 'ai' && !message.isTyping && message.followUpQuestions && message.followUpQuestions.length > 0 && (
                      <div className={cn(
                        "flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-top-1 duration-500",
                        isFullScreenInstance ? "max-w-3xl mx-auto w-full px-2" : "px-4"
                      )}>
                        {message.followUpQuestions.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleFollowUpClick(question)}
                            className="text-xs transition-all duration-200 border border-intranet-primary/30 text-intranet-primary hover:bg-intranet-primary hover:text-white px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm shadow-sm"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    )}
                </React.Fragment>
              ))
            )}
            {isSendingChatMessage && chatMessages[chatMessages.length - 1]?.sender === 'user' && (
              <div className={cn("flex justify-start", isFullScreenInstance && "max-w-3xl mx-auto w-full px-2")}>
                <div className="max-w-xs lg:max-w-md px-3 py-2 rounded-lg bg-gray-200 text-gray-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className={cn("flex gap-2 items-center", isFullScreenInstance && "max-w-3xl mx-auto w-full pt-2 pb-4 px-2")}>
            <Input
              placeholder={isFullScreenInstance ? "Ask anything..." : "Type your question..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn("flex-1", isFullScreenInstance && "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-intranet-primary focus:border-intranet-primary h-12 text-base")}
              disabled={isSendingChatMessage || uiIsActuallyLoading || (!apiKey || !apiEndpoint)}
            />
            <Button
              type="submit"
              className={cn(
                "bg-intranet-primary hover:bg-intranet-secondary",
                isFullScreenInstance && "h-12 w-12 rounded-full p-0"
              )}
              disabled={isSendingChatMessage || !query.trim() || uiIsActuallyLoading || (!apiKey || !apiEndpoint)}
            >
              {isSendingChatMessage ? <Loader2 className="h-5 w-5" /> : <Send size={isFullScreenInstance ? 20 : 18} />}
            </Button>
          </form>
          {(!apiKey || !apiEndpoint) && !uiIsActuallyLoading && !isFullScreenInstance && (
            <p className="text-xs text-red-500 mt-2">
              AI Assistant is not fully configured. Admins: please set API Key and Endpoint in the 'AI Configuration' section.
            </p>
          )}
        </CardContent>
      </Card >
    );
  };

  return (
    <PageLayout hideNavAndFooter={isChatFullScreen}>
      {!isChatFullScreen && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">AI Knowledge Hub</h1>
          <div className="flex flex-col md:flex-row gap-4 items-center mt-2 mb-4">
            <Input placeholder="Search across organizational knowledge... (feature coming soon)" className="flex-1" disabled />
            <p className="text-gray-500 text-sm whitespace-nowrap">Access AI-powered insights and search across organizational knowledge</p>
          </div>
        </div>
      )}

      {/* Normal View Layout */}
      {!isChatFullScreen && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[600px] lg:h-[700px]">
              {renderAIChatInterface(false)} {/* AI Assistant Card in normal flow */}
            </div>

            <div className="space-y-6">
              {/* Featured Document Section */}
              <div className="mt-2">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-intranet-primary" />
                  Featured Legislation
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      title: "Capital Market Act 2015",
                      desc: "Market Structure, Licensing, Conduct, and Securities Regulation.",
                      url: "https://scpng.gov.pg/wp-content/uploads/2022/09/cma2015.pdf"
                    },
                    {
                      title: "Central Depositories Act 2015",
                      desc: "Clearing, Settlement, and Market Infrastructure.",
                      url: "https://scpng.gov.pg/wp-content/uploads/2022/09/cda2015.pdf"
                    },
                    {
                      title: "Securities Commission Act 2015",
                      desc: "Establishment, Powers, and Governance of the Regulator.",
                      url: "https://www.scpng.gov.pg/wp-content/uploads/2022/09/sca2015.pdf"
                    },
                    {
                      title: "Securities Act 1997",
                      desc: "Historical Context and Transitional Provisions.",
                      url: "https://scpng.gov.pg/wp-content/uploads/2022/09/sa1997.pdf"
                    }
                  ].map((act, idx) => (
                    <a
                      key={idx}
                      href={act.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-card hover:bg-accent rounded-lg shadow-sm transition-colors border border-border group"
                    >
                      <div className="bg-intranet-light dark:bg-intranet-dark p-2 rounded-lg mr-3">
                        <FileText className="h-5 w-5 text-intranet-primary flex-shrink-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-intranet-primary">{act.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {act.desc}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-intranet-primary ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Section for Uploaded SharePoint Files */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-3">Uploaded Knowledge Documents</h2>
                {isLoadingFiles ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-gray-500">Loading documents...</span>
                  </div>
                ) : loadFilesError ? (
                  <p className="text-red-500">{loadFilesError}</p>
                ) : uploadedSharePointFiles.length === 0 ? (
                  <p className="text-gray-500">No documents have been uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {uploadedSharePointFiles.map(file => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-card hover:bg-accent rounded-lg shadow-sm transition-colors border border-border group"
                      >
                        {file.type === 'link' ?
                          <LinkIcon className="h-5 w-5 mr-3 text-intranet-primary flex-shrink-0" /> :
                          <FileText className="h-5 w-5 mr-3 text-intranet-primary flex-shrink-0" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-intranet-primary">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded: {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-intranet-primary ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 h-[700px] sticky top-6">
            {isSystemAdmin ? (
              <Tabs defaultValue="library" className="w-full h-full flex flex-col border border-border rounded-xl bg-card overflow-hidden shadow-sm">
                <div className="px-4 pt-4 pb-2 border-b border-border bg-gray-50/50 dark:bg-gray-900/50">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="library" className="flex items-center gap-2">
                      <BookOpen size={14} /> Library
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center gap-2">
                      <Settings size={14} /> Admin
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="library" className="flex-1 overflow-hidden m-0 p-0 border-none">
                  <QuestionLibrarySidebar onSelectQuestion={handleLibraryQuestionSelect} />
                </TabsContent>

                <TabsContent value="admin" className="flex-1 overflow-y-auto m-0 p-4 space-y-6 custom-scrollbar">
                  <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-sm">Knowledge Areas</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">Upload documents or links.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-0 pb-0">
                      {knowledgeAreas.map((area, index) => (
                        <div
                          key={index}
                          className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors border border-border/50"
                          onClick={() => openUploadModalForArea(area.title)}
                        >
                          <div className="bg-intranet-light dark:bg-intranet-dark p-2 rounded-lg mr-3">
                            <area.icon size={18} className="text-intranet-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-xs">{area.title}</h3>
                            <p className="text-[10px] text-gray-500 leading-tight">{area.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-none bg-transparent pt-4 border-t border-border mt-4">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-sm">AI Configuration</CardTitle>
                      <CardDescription className="text-[10px] text-muted-foreground">Manage API settings for the AI Assistant.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                      {uiIsActuallyLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="aiApiKey" className="text-xs">API Key</Label>
                            <Input
                              id="aiApiKey"
                              type="password"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              className="h-8 text-xs"
                              placeholder="Enter API Key"
                              disabled={!canEditSettings || isSaving || isTesting}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="aiApiEndpoint" className="text-xs">Endpoint</Label>
                            <Input
                              id="aiApiEndpoint"
                              value={apiEndpoint}
                              onChange={(e) => setApiEndpoint(e.target.value)}
                              className="h-8 text-xs"
                              placeholder="Enter Endpoint"
                              disabled={!canEditSettings || isSaving || isTesting}
                            />
                          </div>
                          <div className="flex flex-col gap-2 pt-2">
                            <Button
                              onClick={handleTestAiConnection}
                              disabled={isTesting || isSaving || !canEditSettings || (!apiKey && !apiEndpoint)}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                            >
                              {isTesting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                              Test Connection
                            </Button>
                            <Button
                              onClick={handleSaveAiSettings}
                              disabled={isSaving || isTesting || !canEditSettings}
                              size="sm"
                              className="h-8 text-xs"
                            >
                              {isSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                              Save Settings
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-full border border-border rounded-xl bg-card overflow-hidden shadow-sm">
                <QuestionLibrarySidebar onSelectQuestion={handleLibraryQuestionSelect} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Screen View Layout */}
      {isChatFullScreen && (
        <div className="fixed inset-0 z-50 flex flex-col p-0 m-0 bg-background dark:bg-intranet-dark">
          {renderAIChatInterface(true)} {/* AI Assistant Card in full screen mode */}
        </div>
      )}

      <KnowledgeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedKnowledgeArea(null);
        }}
        onUpload={handleKnowledgeUpload}
        knowledgeAreaTitle={selectedKnowledgeArea}
      />

      <AlertDialog open={isClearChatDialogOpen} onOpenChange={setIsClearChatDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your current conversation history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearChat}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default AIHub;
