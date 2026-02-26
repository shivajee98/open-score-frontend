"use client";

import { useState, useEffect } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { Mic, PhoneOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const retellWebClient = new RetellWebClient();

export default function TalkingAgent() {
    const [isCalling, setIsCalling] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [agentName, setAgentName] = useState<string | null>(null);

    useEffect(() => {
        // Setup event listeners
        retellWebClient.on("call_started", () => {
            setIsCalling(true);
            setIsConnecting(false);
        });

        retellWebClient.on("call_ended", () => {
            setIsCalling(false);
            setIsConnecting(false);
            setAgentName(null);
        });

        retellWebClient.on("error", (error) => {
            console.error("Retell Error:", error);
            toast.error("Call failed to connect.");
            setIsCalling(false);
            setIsConnecting(false);
            setAgentName(null);
        });

        return () => {
            if (isCalling || isConnecting) {
                retellWebClient.stopCall();
            }
        };
    }, [isCalling, isConnecting]);

    const toggleCall = async () => {
        if (isCalling || isConnecting) {
            retellWebClient.stopCall();
            setIsCalling(false);
            setIsConnecting(false);
            setAgentName(null);
            return;
        }

        try {
            setIsConnecting(true);

            // Call our local test server
            const response = await fetch("http://localhost:8081/start-dynamic-call", {
                method: "POST",
            });

            const data = await response.json();

            setAgentName(data.persona.name);

            // Start the call with Retell SDK
            await retellWebClient.startCall({
                accessToken: data.access_token,
                sampleRate: 24000,
            });

        } catch (e: any) {
            console.error("Error starting call:", e);
            toast.error(e.message || "Could not reach support right now.");
            setIsConnecting(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
            {(isCalling || isConnecting) && (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-primary/20 flex flex-col items-center gap-2 animate-in slide-in-from-bottom-5">
                    <div className="text-sm font-medium text-gray-800">
                        {isConnecting ? "Connecting to Support..." : `Talking to ${agentName || 'Agent'}`}
                    </div>
                    {isCalling && (
                        <div className="flex gap-1.5 items-center justify-center p-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[bounce_1s_infinite] delay-75"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[bounce_1s_infinite] delay-150"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[bounce_1s_infinite] delay-300"></span>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={toggleCall}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 ${isCalling ? 'bg-red-500 text-white hover:bg-red-600 ring-4 ring-red-500/30' :
                    isConnecting ? 'bg-primary/80 text-white cursor-wait' :
                        'bg-gradient-to-br from-primary to-primary-light text-white hover:shadow-primary/50'
                    }`}
                aria-label="Talk to Support"
            >
                {isConnecting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : isCalling ? (
                    <PhoneOff className="w-6 h-6 animate-in zoom-in" />
                ) : (
                    <Mic className="w-6 h-6 animate-in zoom-in" />
                )}
            </button>
        </div>
    );
}
