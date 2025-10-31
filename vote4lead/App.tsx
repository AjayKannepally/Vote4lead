
import React, { useState, useCallback } from 'react';
import type { Candidate, Voter, Vote, ChatMessage, ElectionState, GeminiResponse } from './types';
import { processUserCommand } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import ResultsDashboard from './components/ResultsDashboard';
import { UserIcon, BotIcon } from './components/Icons';

export default function App(): React.JSX.Element {
  const [electionState, setElectionState] = useState<ElectionState>({
    candidates: [],
    voters: [],
    votes: [],
    anomalies: [],
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Welcome to the AI Election Assistant. How can I help you manage your election today? You can start by registering candidates, like: "Register candidates: Ajay, Neha, Rahul"',
    },
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setChatHistory(prev => [...prev, { sender: 'user', text: message }]);

    try {
      const result: GeminiResponse = await processUserCommand(message, electionState);
      
      setElectionState(prevState => ({
        ...prevState,
        candidates: result.updatedCandidates !== undefined ? result.updatedCandidates : prevState.candidates,
        voters: result.updatedVoters !== undefined ? result.updatedVoters : prevState.voters,
        votes: result.newVote ? [...prevState.votes, result.newVote] : prevState.votes,
        anomalies: result.anomalies ? [...(prevState.anomalies || []), ...result.anomalies] : prevState.anomalies,
      }));
      
      setChatHistory(prev => [...prev, { sender: 'assistant', text: result.responseMessage }]);

    } catch (error)