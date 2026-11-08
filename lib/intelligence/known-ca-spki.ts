   
                                                                                      
                                                                        
                                                                                       
                                                                      
   
export const KNOWN_COMPROMISED_TLS_SPKI: Record<string, { incident: string; intermediate: string; source: string }> = {
  "EBED6475C2C2D80FCB199F3FE8DD6E6B3CE60B77EB15D4E42C3DEC0C6F5B5105": { incident: "eMudhra weak intermediate CA keys (Oct 2026)", intermediate: "EM DV TLS CA - G3B", source: "https://kudelskisecurity.com/research/emudhra-intermediate-ca-private-key-compromise" },
  "49DD353DC2B919A3770645117D0E60C16115E7D1BC259EEFE734B00EA434FE5F": { incident: "eMudhra weak intermediate CA keys (Oct 2026)", intermediate: "EM DV TLS CA - G3C", source: "https://kudelskisecurity.com/research/emudhra-intermediate-ca-private-key-compromise" },
  "E0254C7FCDC265E2F0F8A428DABB75AB4AE039B4872D62F5EE57F0877D5A8A41": { incident: "eMudhra weak intermediate CA keys (Oct 2026)", intermediate: "EM EV TLS CA - G3B", source: "https://kudelskisecurity.com/research/emudhra-intermediate-ca-private-key-compromise" },
  "5C0660A2B164910D8FF589C18E14552E9E0EC237DCEFE2CB736D41A4811F81A0": { incident: "eMudhra weak intermediate CA keys (Oct 2026)", intermediate: "EM EV TLS CA - G3C", source: "https://kudelskisecurity.com/research/emudhra-intermediate-ca-private-key-compromise" },
  "43BFFA19D6EF651451F6841E019931E96F6F2EAEFF28AB4B6F1CE4576DE2717B": { incident: "eMudhra weak intermediate CA keys (Oct 2026)", intermediate: "EM OV TLS CA - G3B", source: "https://kudelskisecurity.com/research/emudhra-intermediate-ca-private-key-compromise" },
  "63ECEFEE431D49523BC1136C4E72D0206A477086CAF606CD5CF025686C109CF8": { incident: "eMudhra weak intermediate CA keys (Oct 2026)", intermediate: "EM OV TLS CA - G3C", source: "https://kudelskisecurity.com/research/emudhra-intermediate-ca-private-key-compromise" },
};
