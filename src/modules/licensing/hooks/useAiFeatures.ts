import { useState, useEffect } from 'react';
import { Groq } from 'groq-sdk';
import { FormData } from '../types';
import { MainView } from '../types'; // Added MainView import
import { LicenseTypeData, placeholderLicenseType } from '../constants'; // Added imports

interface UseAiFeaturesProps {
  activeMainView: MainView;
  apiKey: string;
  selectedLicenseType: LicenseTypeData; // Updated type
  aiProvider: string;
  aiModel: string;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export const useAiFeatures = ({
  activeMainView,
  apiKey,
  selectedLicenseType,
  aiProvider,
  aiModel,
  setFormData,
}: UseAiFeaturesProps) => {
  const [aiConfig, setAiConfig] = useState({
    provider: aiProvider,
    key: apiKey,
    model: aiModel,
  });
  const [activeAiConfigTab, setActiveAiConfigTab] = useState<string>('general');

  // Effect for AI-powered form pre-filling
  useEffect(() => {
    // Check if a valid license type is selected (not the placeholder)
    if (activeMainView === 'create' && aiConfig.key && selectedLicenseType && selectedLicenseType.id !== placeholderLicenseType.id && aiConfig.provider === 'Groq') {
      const licenseTypeName = selectedLicenseType.name; // Use name for logs and prompts
      console.log(`AI Call Triggered: License Type - ${licenseTypeName}, Provider - ${aiConfig.provider}, Model - ${aiConfig.model}`);
      const relevantDocumentContent = "Simulated content from knowledge base documents related to " + licenseTypeName;

      const callGroqApi = async () => {
        try {
          const groq = new Groq({ apiKey: aiConfig.key, dangerouslyAllowBrowser: true });
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: "You are an assistant that helps pre-fill form data for Capital Market Licenses based on a selected license type and relevant sections of acts from a knowledge base. Provide the data as a JSON object with keys matching the FormData interface: issuedDate, expiryDate, licenseNumber, licenseeName, regulatedActivity, legalReference, signatoryName, signatoryTitle."
              },
              {
                role: "user",
                content: `The selected license type is "${licenseTypeName}". Based on the following information from our knowledge base: "${relevantDocumentContent}", please provide the typical values for the license form. For fields like 'licenseeName', 'licenseNumber', 'issuedDate', 'expiryDate', if these are typically unique per license, you can use placeholder text like 'Enter Licensee Name', 'CMLXXXXXX', 'DD/MM/YYYY' etc. For 'regulatedActivity' and 'legalReference', provide specific text based on the license type and knowledge base. For 'signatoryName' and 'signatoryTitle', provide common defaults if available, otherwise placeholders. Respond with ONLY the JSON object.`
              }
            ],
            model: aiConfig.model,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
          });

          const responseContent = chatCompletion.choices[0]?.message?.content;
          if (responseContent) {
            console.log("Groq API Response:", responseContent);
            try {
              let cleanedResponseContent = responseContent.trim();
              if (cleanedResponseContent.startsWith("```json")) {
                cleanedResponseContent = cleanedResponseContent.substring(7);
              } else if (cleanedResponseContent.startsWith("```")) {
                cleanedResponseContent = cleanedResponseContent.substring(3);
              }
              if (cleanedResponseContent.endsWith("```")) {
                cleanedResponseContent = cleanedResponseContent.slice(0, -3);
              }
              cleanedResponseContent = cleanedResponseContent.trim();

              const parsedData = JSON.parse(cleanedResponseContent) as Partial<FormData>; // Type assertion
              setFormData(prevData => ({
                ...prevData,
                ...(parsedData.regulatedActivity && { regulatedActivity: parsedData.regulatedActivity }),
                ...(parsedData.legalReference && { legalReference: parsedData.legalReference }),
                issuedDate: parsedData.issuedDate || prevData.issuedDate,
                expiryDate: parsedData.expiryDate || prevData.expiryDate,
                licenseNumber: parsedData.licenseNumber || prevData.licenseNumber,
                licenseeName: parsedData.licenseeName || prevData.licenseeName,
                signatoryName: parsedData.signatoryName || prevData.signatoryName,
                signatoryTitle: parsedData.signatoryTitle || prevData.signatoryTitle,
              }));
              console.log("Form data updated with AI response.");
            } catch (error) {
              console.error("Error parsing AI response JSON:", error);
            }
          } else {
            console.log("No content in AI response.");
          }
        } catch (error) {
          console.error('Error calling Groq API for pre-fill:', error);
        }
      };
      callGroqApi();
    }
  }, [selectedLicenseType, aiConfig, activeMainView, setFormData]); // Added setFormData to dependencies

  return {
    aiConfig,
    setAiConfig,
    activeAiConfigTab,
    setActiveAiConfigTab,
  };
}; 