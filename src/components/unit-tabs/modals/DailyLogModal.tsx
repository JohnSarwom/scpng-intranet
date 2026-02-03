import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Clock, AlertTriangle, Coffee } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DailyLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DailyLogModal: React.FC<DailyLogModalProps> = ({ isOpen, onClose }) => {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [tasksCompleted, setTasksCompleted] = useState('');
    const [blockers, setBlockers] = useState('');
    const [morale, setMorale] = useState([8]);
    const [workHours, setWorkHours] = useState('8');

    const handleSubmit = async () => {
        setSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast({
            title: "Daily Log Submitted",
            description: "Your activity has been recorded for the weekly roll-up.",
            duration: 3000,
        });

        setSubmitting(false);
        setStep(1);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>End of Day Check-in</DialogTitle>
                    <DialogDescription>
                        Step {step} of 3: {step === 1 ? 'Activity Summary' : step === 2 ? 'Metrics & Morale' : 'Review'}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">

                    {/* STEP 1: Activity */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    What did you achieve today?
                                </Label>
                                <Textarea
                                    placeholder="- Completed API integration&#10;- Fixed bug #123"
                                    className="min-h-[120px]"
                                    value={tasksCompleted}
                                    onChange={e => setTasksCompleted(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    Any blockers or issues?
                                </Label>
                                <Input
                                    placeholder="Waiting on design approval..."
                                    value={blockers}
                                    onChange={e => setBlockers(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Metrics */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-4">
                                <Label className="flex justify-between">
                                    <span className="flex items-center gap-2"><Coffee className="w-4 h-4 text-blue-500" /> Energy / Morale</span>
                                    <span className="text-muted-foreground">{morale[0]}/10</span>
                                </Label>
                                <Slider
                                    value={morale}
                                    onValueChange={setMorale}
                                    max={10}
                                    step={1}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Drained</span>
                                    <span>Energized</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" /> Hours Worked
                                </Label>
                                <Select value={workHours} onValueChange={setWorkHours}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select hours" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="4">Half Day (4h)</SelectItem>
                                        <SelectItem value="8">Full Day (8h)</SelectItem>
                                        <SelectItem value="10">Overtime (10h+)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Review */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="rounded-md bg-muted/50 p-4 space-y-3">
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Key Achievements</span>
                                    <p className="text-sm mt-1 whitespace-pre-line">{tasksCompleted || "No tasks listed."}</p>
                                </div>
                                {blockers && (
                                    <div>
                                        <span className="text-xs font-semibold text-orange-600 uppercase">Blockers</span>
                                        <p className="text-sm mt-1 text-orange-700 dark:text-orange-400">{blockers}</p>
                                    </div>
                                )}
                                <div className="flex gap-4 pt-2">
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground">Morale</span>
                                        <p className="text-sm font-medium">{morale[0]}/10</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground">Hours</span>
                                        <p className="text-sm font-medium">{workHours}h</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-center text-muted-foreground">
                                This log will be included in the weekly unit report automatically.
                            </p>
                        </div>
                    )}

                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={submitting}>
                            Back
                        </Button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)}>
                            Next Step
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-intranet-primary hover:bg-intranet-primary/90">
                            {submitting ? 'Submitting...' : 'Confirm & Log'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DailyLogModal;
