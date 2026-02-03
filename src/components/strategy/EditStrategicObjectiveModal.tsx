/**
 * EditStrategicObjectiveModal Component
 * Modal for editing Strategic Objectives in the Strategy Hub
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Plus, X, Target, Award, Zap, TrendingUp, Users, Heart, Shield, Lightbulb, ShieldCheck, Building2, GraduationCap, Globe, Rocket, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StrategicItem } from '@/mockData/strategyData';
import { useStrategySharePoint } from '@/hooks/useStrategySharePoint';

interface EditStrategicObjectiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    objective: StrategicItem | null;
}

const ICON_OPTIONS = [
    { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
    { value: 'ShieldCheck', label: 'Shield Check', icon: ShieldCheck },
    { value: 'Building2', label: 'Building', icon: Building2 },
    { value: 'GraduationCap', label: 'Education', icon: GraduationCap },
    { value: 'Globe', label: 'Globe', icon: Globe },
    { value: 'Target', label: 'Target', icon: Target },
    { value: 'Award', label: 'Award', icon: Award },
    { value: 'Zap', label: 'Zap', icon: Zap },
    { value: 'Users', label: 'Users', icon: Users },
    { value: 'Heart', label: 'Heart', icon: Heart },
    { value: 'Shield', label: 'Shield', icon: Shield },
    { value: 'Lightbulb', label: 'Lightbulb', icon: Lightbulb },
    { value: 'Rocket', label: 'Rocket', icon: Rocket },
    { value: 'Layers', label: 'Layers', icon: Layers },
];

export const EditStrategicObjectiveModal: React.FC<EditStrategicObjectiveModalProps> = ({ isOpen, onClose, onSuccess, objective }) => {
    const { toast } = useToast();
    const { updateObjective } = useStrategySharePoint();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('on-track');
    const [icon, setIcon] = useState('Target');
    const [goals, setGoals] = useState<string[]>([]);
    const [newGoal, setNewGoal] = useState('');

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate form when objective changes
    useEffect(() => {
        if (objective && isOpen) {
            setTitle(objective.title);
            setDescription(objective.description || '');
            setProgress(objective.progress || 0);
            setStatus(objective.status || 'on-track');

            // Handle icon mapping if it comes as a Component or string
            let iconVal = 'Target';
            if (typeof objective.icon === 'string') {
                iconVal = objective.icon;
            } else if ((objective as any).IconName) {
                iconVal = (objective as any).IconName;
            }
            setIcon(iconVal);

            // Handle goals/deliverables
            // StrategyService returns 'goals' property from 'Deliverables' field
            setGoals((objective as any).goals || []);
        }
    }, [objective, isOpen]);

    const handleAddGoal = () => {
        if (newGoal.trim()) {
            setGoals([...goals, newGoal.trim()]);
            setNewGoal('');
        }
    };

    const handleRemoveGoal = (index: number) => {
        const newGoals = [...goals];
        newGoals.splice(index, 1);
        setGoals(newGoals);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!objective || !objective.id) return;
        if (!title.trim()) {
            toast({ title: 'Title is required', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        try {
            await updateObjective(objective.id, {
                title,
                description,
                progress,
                status: status as any,
                icon,
                // Pass goals as is, service will join them
                goals: goals
            } as any);

            toast({
                title: 'Success',
                description: 'Strategic Objective updated successfully.',
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update objective:', error);
            // Toast is handled by hook/service usually, but safety net here
            toast({
                title: 'Error',
                description: 'Failed to update objective.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!objective) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && !isSubmitting) onClose();
        }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Strategic Objective</DialogTitle>
                    <DialogDescription>
                        Update the milestones and progress for this strategic initiative.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="title">Objective Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        {/* Icon Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon</Label>
                            <Select value={icon} onValueChange={setIcon} disabled={isSubmitting}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {ICON_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <opt.icon className="w-4 h-4" />
                                                <span>{opt.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={setStatus} disabled={isSubmitting}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="on-track">On Track</SelectItem>
                                    <SelectItem value="at-risk">At Risk</SelectItem>
                                    <SelectItem value="behind">Behind</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2 col-span-2">
                            <div className="flex justify-between">
                                <Label>Progress</Label>
                                <span className="text-sm text-muted-foreground font-medium">{progress}%</span>
                            </div>
                            <Slider
                                value={[progress]}
                                onValueChange={(val) => setProgress(val[0])}
                                max={100}
                                step={5}
                                disabled={isSubmitting}
                                className="py-2"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Key Deliverables / Goals */}
                    <div className="space-y-3 pt-2 border-t">
                        <Label>Key Deliverables & Milestones</Label>

                        <div className="space-y-2">
                            {goals.map((goal, index) => (
                                <div key={index} className="flex items-start gap-2 group">
                                    <div className="flex-1 p-2 rounded-md bg-muted/50 text-sm">
                                        {goal}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveGoal(index)}
                                        disabled={isSubmitting}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-2">
                            <Input
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                placeholder="Add a new deliverable..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddGoal();
                                    }
                                }}
                                disabled={isSubmitting}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddGoal}
                                disabled={isSubmitting || !newGoal.trim()}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditStrategicObjectiveModal;
