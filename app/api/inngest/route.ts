import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { investigateUrl } from "@/inngest/functions";
import { investigateMessage } from "@/inngest/message-functions";
import { publishReviewedReport } from "@/inngest/blockchain-functions";
export const { GET, POST, PUT } = serve({ client: inngest, functions: [investigateUrl, investigateMessage, publishReviewedReport] });
