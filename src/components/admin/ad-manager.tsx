
'use client';
import type { AdCode } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateAdCode } from '@/lib/actions';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

type AdManagerProps = {
  adCodes: AdCode[];
};

export function AdManager({ adCodes }: AdManagerProps) {

  return (
    <div className="mx-auto w-full max-w-6xl my-8">
      <Card>
        <CardHeader>
            <CardTitle>Manage Ad Codes</CardTitle>
            <CardDescription>
              Update the ad snippets for various placements across the site. You can paste the full HTML/script code from your ad provider here.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {adCodes.map(adCode => (
                    <AdCodeAccordionItem key={adCode.id} adCode={adCode} />
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}


function AdCodeAccordionItem({ adCode }: { adCode: AdCode }) {
    const boundUpdateAdCode = updateAdCode.bind(null, adCode.id);
    const [state, dispatch] = useFormState(boundUpdateAdCode, { success: false, errors: {} });
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
  
    useEffect(() => {
      if (state.success) {
        toast({ title: "Success!", description: state.message });
      } else if (state.errors?.server) {
        toast({ title: "Error", description: state.errors.server.join(', '), variant: "destructive" });
      }
    }, [state, toast]);

    return (
        <AccordionItem value={adCode.id}>
            <AccordionTrigger className='font-medium'>{adCode.name}</AccordionTrigger>
            <AccordionContent>
                <form ref={formRef} action={dispatch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`code-${adCode.id}`}>Ad Code (HTML/Script)</Label>
                        <Textarea 
                            id={`code-${adCode.id}`}
                            name="code" 
                            defaultValue={adCode.code} 
                            rows={8}
                            className="font-mono text-xs"
                            placeholder="Paste your ad code snippet here..."
                        />
                        {state.errors?.code && <p className="text-sm text-destructive">{state.errors.code.join(', ')}</p>}
                    </div>
                    <SubmitButton />
                </form>
            </AccordionContent>
      </AccordionItem>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save Ad Code"}</Button>;
}
