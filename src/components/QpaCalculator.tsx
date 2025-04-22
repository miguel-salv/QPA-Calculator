"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Upload, Plus, Info, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast"
import { parseCMUTranscript } from '@/lib/utils';
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

interface Course {
  id: string;
  name: string;
  units: number | string;
  grade: string;
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
  isEditing?: boolean;
}

const gradePoints: { [key: string]: number | null } = {
  "A": 4.0,
  "B": 3.0,
  "C": 2.0,
  "D": 1.0,
  "F": 0.0,
  "NO_GRADE": null
};

const calculateSemesterGpa = (courses: Course[]): number => {
  let totalQualityPoints = 0;
  let totalFactorableUnits = 0;
  
  courses.forEach(course => {
    const points = gradePoints[course.grade];
    const units = typeof course.units === 'string' ? parseFloat(course.units) : course.units;
    if (points !== null && points !== undefined && units !== undefined && !isNaN(units)) {
      totalQualityPoints += units * points;
      totalFactorableUnits += units;
    }
  });

  if (totalFactorableUnits === 0) return 0.0;
  return parseFloat((totalQualityPoints / totalFactorableUnits).toFixed(2));
};

const QpaCalculator = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [qpa, setQpa] = useState<number>(0.0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedSemesters = localStorage.getItem('semesters');
    if (storedSemesters) {
      setSemesters(JSON.parse(storedSemesters));
    } else {
      setSemesters([{ id: crypto.randomUUID(), name: `Semester 1`, courses: [] }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('semesters', JSON.stringify(semesters));
    calculateQpa();
  }, [semesters]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, 100); // Small delay to ensure the DOM has updated
  };

  const addSemester = () => {
    setSemesters(prevSemesters => [
      ...prevSemesters,
      {
        id: crypto.randomUUID(),
        name: `Semester ${prevSemesters.length + 1}`,
        courses: [],
      }
    ]);
    
    // Scroll to the bottom after adding a semester
    scrollToBottom();
  };

  const removeSemester = (id: string) => {
    setSemesters(prevSemesters => {
      const updatedSemesters = prevSemesters.filter(semester => semester.id !== id);
      // If we're removing the last semester, add a new empty one
      if (updatedSemesters.length === 0) {
        return [{ id: crypto.randomUUID(), name: 'Semester 1', courses: [] }];
      }
      return updatedSemesters;
    });
  };

  const addCourse = (semesterId: string) => {
    setSemesters(prevSemesters =>
      prevSemesters.map(semester =>
        semester.id === semesterId
          ? {
            ...semester,
            courses: [
              ...semester.courses,
              {
                id: crypto.randomUUID(),
                name: '',
                units: '',
                grade: 'NO_GRADE'
              }
            ],
          }
          : semester
      )
    );
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters(prevSemesters =>
      prevSemesters.map(semester =>
        semester.id === semesterId
          ? {
            ...semester,
            courses: semester.courses.filter(course => course.id !== courseId),
          }
          : semester
      )
    );
  };

  const updateCourse = (semesterId: string, courseId: string, field: string, value: string | number) => {
    setSemesters(prevSemesters =>
      prevSemesters.map(semester =>
        semester.id === semesterId
          ? {
            ...semester,
            courses: semester.courses.map(course =>
              course.id === courseId
                ? { ...course, [field]: value }
                : course
            ),
          }
          : semester
      )
    );
  };

  const updateSemesterName = (semesterId: string, newName: string) => {
    setSemesters(prevSemesters =>
      prevSemesters.map((semester, idx) =>
        semester.id === semesterId
          ? { ...semester, name: newName || `Semester ${idx + 1}`, isEditing: false }
          : semester
      )
    );
  };

  const toggleSemesterEdit = (semesterId: string) => {
    setSemesters(prevSemesters =>
      prevSemesters.map(semester =>
        semester.id === semesterId
          ? { ...semester, isEditing: !semester.isEditing }
          : semester
      )
    );
  };

  const calculateQpa = useCallback(() => {
    let totalQualityPoints = 0;
    let totalFactorableUnits = 0;
    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        const points = gradePoints[course.grade];
        const units = typeof course.units === 'string' ? parseFloat(course.units) : course.units;
        // Only factor in grades that have numeric grade points (excludes P, R, W, N)
        if (points !== null && points !== undefined && units !== undefined && !isNaN(units)) {
          totalQualityPoints += units * points;
          totalFactorableUnits += units;
        }
      });
    });
    if (totalFactorableUnits === 0) {
      setQpa(0.0);
    } else {
      setQpa(parseFloat((totalQualityPoints / totalFactorableUnits).toFixed(2)));
    }
  }, [semesters]);

  const handleUnitsChange = (semesterId: string, courseId: string, value: string) => {
    updateCourse(semesterId, courseId, 'units', value === '' ? '' : parseFloat(value));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Please upload a PDF file');
      }
      const parsedSemesters = await parseCMUTranscript(file);
      if (parsedSemesters.length === 0) {
        throw new Error('No semester data found. Please make sure this is a CMU academic record PDF.');
      }
      const newSemesters = parsedSemesters.map(sem => ({
        id: crypto.randomUUID(),
        name: sem.name,
        courses: sem.courses.map(course => ({
          id: crypto.randomUUID(),
          name: course.name,
          units: course.units,
          grade: course.grade
        }))
      }));
      if (newSemesters.some(sem => sem.courses.length === 0)) {
        throw new Error('Some semesters have no courses. Please make sure the PDF is properly formatted.');
      }
      setSemesters(newSemesters);
      toast({
        title: "Success",
        description: `Imported ${newSemesters.length} semesters with ${newSemesters.reduce((acc, sem) => acc + sem.courses.length, 0)} courses from your academic record.`,
      });
    } catch (error) {
      console.error('Error parsing PDF:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse the academic record. Please make sure you uploaded a valid CMU academic record PDF.",
        variant: "destructive",
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      <div className="max-w-2xl mx-auto text-center space-y-4 mb-8 pt-2">
        <p className="text-sm md:text-base text-muted-foreground font-medium">
          Enter your courses and grades to calculate your Quality Point Average.
          All data processing happens locally in your browser - your academic records are never sent to any server.
        </p>
      </div>

      <div className="mt-4 flex flex-col md:flex-row justify-center gap-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
          ref={fileInputRef}
        />
        <Button className="w-full md:w-auto" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Import from Academic Record
        </Button>
        <Button className="w-full md:w-auto" variant="outline" onClick={addSemester}>
          <Plus className="h-4 w-4 mr-2" />
          Add Semester Manually
        </Button>
      </div>

      <ScrollArea 
        className="rounded-md border my-6" 
        style={{ height: 'calc(100vh - 400px)', minHeight: '300px' }}
      >
        <div ref={scrollContainerRef} className="flex flex-col gap-4 p-4">
          {semesters.map((semester, index) => {
            const semesterGpa = calculateSemesterGpa(semester.courses);
            return (
              <Card key={semester.id} className="mb-4">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-2 min-h-[48px]">
                  <div className="flex items-center space-x-4 w-full">
                    {semester.isEditing ? (
                      <Input
                        type="text"
                        value={semester.name}
                        onChange={(e) => updateSemesterName(semester.id, e.target.value)}
                        className="w-full md:w-1/3 font-semibold"
                        placeholder={`Semester ${index + 1}`}
                        onBlur={() => toggleSemesterEdit(semester.id)}
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{semester.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSemesterEdit(semester.id)}
                          className="h-5 w-5 p-0 hover:bg-transparent opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <Pencil className="h-2.5 w-2.5 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center ml-auto">
                      <span className="text-sm text-muted-foreground mr-2">Semester GPA:</span>
                      <span className="font-semibold">{semesterGpa}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeSemester(semester.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {semester.courses.map(course => (
                      <div key={course.id} className="flex flex-col md:flex-row gap-2 md:items-center md:space-x-2">
                        <Input
                          type="text"
                          placeholder="Course Name (Optional)"
                          className="w-full md:w-1/3 hover:border-primary/50 transition-colors"
                          value={course.name}
                          onChange={(e) => updateCourse(semester.id, course.id, 'name', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Units"
                          className="w-full md:w-1/6 hover:border-primary/50 transition-colors"
                          value={course.units === '' ? '' : String(course.units)}
                          onChange={(e) => handleUnitsChange(semester.id, course.id, e.target.value)}
                        />
                        
                        <CustomSelect 
                          options={[
                            { value: "NO_GRADE", label: "No Grade" },
                            { value: "A", label: "A" },
                            { value: "B", label: "B" },
                            { value: "C", label: "C" },
                            { value: "D", label: "D" },
                            { value: "F", label: "F" }
                          ]}
                          value={course.grade || "NO_GRADE"}
                          onValueChange={(value) => updateCourse(semester.id, course.id, 'grade', value === "NO_GRADE" ? "" : value)}
                          className="w-full md:w-[120px]"
                          triggerClassName={cn(
                            "hover:border-primary/50 transition-colors", 
                            (!course.grade || course.grade === "NO_GRADE") && "text-muted-foreground"
                          )}
                        />
                        
                        <Button variant="ghost" size="sm" onClick={() => removeCourse(semester.id, course.id)} className="w-full md:w-auto hover:text-primary transition-colors justify-center">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={() => addCourse(semester.id)} className="w-full md:w-auto hover:text-primary transition-colors">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />
      <div className="text-center">
        <h3 className="text-lg md:text-xl font-semibold">Your QPA:</h3>
        <p className="text-2xl md:text-3xl font-bold text-primary">{qpa}</p>
      </div>
    </div>
  );
};

export default QpaCalculator;
