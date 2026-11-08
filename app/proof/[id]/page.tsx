import type {Metadata} from "next";
import { PublicProofView } from "@/components/product/public-proof-view";
export const metadata:Metadata={title:"Independent evidence verification"};
export default async function PublicProofPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <PublicProofView id={id}/>;}
