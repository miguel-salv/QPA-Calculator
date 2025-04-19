"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus } from 'lucide-react';
import { toast } from "@/hooks/use-toast"

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
}

const gradePoints: { [key: string]: number } = {
  "A": 4.0,
  "B": 3.0,
  "C": 2.0,
  "D": 1.0,
  "R": 0.0,
};

const defaultSemesterName = "Semester";

const QpaCalculator = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [qpa, setQpa] = useState<number>(0.0);

  useEffect(() => {
    const storedSemesters = localStorage.getItem('semesters');
    if (storedSemesters) {
      setSemesters(JSON.parse(storedSemesters));
    } else {
      // Initialize with one default semester
      setSemesters([{ id: crypto.randomUUID(), name: defaultSemesterName, courses: [] }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('semesters', JSON.stringify(semesters));
    calculateQpa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesters]);

  const addSemester = () => {
    setSemesters(prevSemesters => [
      ...prevSemesters,
      {
        id: crypto.randomUUID(),
        name: defaultSemesterName,
        courses: [],
      }
    ]);
  };

  const removeSemester = (id: string) => {
    setSemesters(prevSemesters => {
      const updatedSemesters = prevSemesters.filter(semester => semester.id !== id);
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
                grade: 'A',
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

  const calculateQpa = useCallback(() => {
    let totalQualityPoints = 0;
    let totalFactorableUnits = 0;

    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        const points = gradePoints[course.grade];
        const units = typeof course.units === 'string' ? parseFloat(course.units) : course.units;

        if (points !== undefined && units !== undefined && !isNaN(units)) {
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


  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">
          Enter Your Academic Information
        </h2>
        <p className="text-muted-foreground">
          Add semesters and courses to calculate your QPA.
        </p>
      </div>

      <ScrollArea className="rounded-md border">
        <div className="flex flex-col gap-4 p-4">
          {semesters.map((semester, index) => (
            <Card key={semester.id} className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 min-h-[48px]">
                <CardTitle>
                  {`Semester ${index + 1}`}
                </CardTitle>
                {semesters.length > 1 ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the semester
                          and all associated course data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeSemester(semester.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <div className="w-9 h-9" />
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {semester.courses.map(course => (
                    <div key={course.id} className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Course Name (Optional)"
                        className="w-1/3"
                        value={course.name}
                        onChange={(e) => updateCourse(semester.id, course.id, 'name', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Units"
                        className="w-1/6"
                        value={course.units === '' ? '' : String(course.units)}
                        onChange={(e) => handleUnitsChange(semester.id, course.id, e.target.value)}
                      />
                      <Select value={course.grade} onValueChange={(value) => updateCourse(semester.id, course.id, 'grade', value)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(gradePoints).map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={() => removeCourse(semester.id, course.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" onClick={() => addCourse(semester.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Button onClick={addSemester} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Semester
      </Button>

      <Separator />

      <div className="text-center">
        <h3 className="text-xl font-semibold">Your QPA:</h3>
        <p className="text-3xl font-bold text-primary">{qpa}</p>
      </div>
    </div>
  );
};

export default QpaCalculator;
