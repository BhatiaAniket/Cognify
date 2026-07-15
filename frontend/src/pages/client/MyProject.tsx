import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderKanban, 
  User, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { clientAPI } from '../../api/client';
import { showToast } from '../../components/Toast';

const MyProject: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await clientAPI.getProject();
        setData(res.data.data);
        // Initially expand first phase
        if (res.data.data.phases?.length > 0) {
          setExpandedPhases({ [res.data.data.phases[0].name]: true });
        }
      } catch (err) {
        showToast('Failed to load project details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, []);

  const togglePhase = (name: string) => {
    setExpandedPhases(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Fetching project details...</p>
      </div>
    );
  }

  if (!data?.project) {
    return (
      <div className="text-center py-20 bg-card border border-border rounded-2xl">
        <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold font-heading mb-2">Project Not Assigned</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          We couldn't find an active project linked to your account. 
          Please check back later or contact support.
        </p>
      </div>
    );
  }

  const { project, phases } = data;

  const priorityColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-600',
    medium: 'bg-amber-100 text-amber-600',
    high: 'bg-red-100 text-red-600',
  };

  const statusColors: Record<string, string> = {
    todo: 'text-muted-foreground',
    in_progress: 'text-blue-500',
    done: 'text-green-500',
    completed: 'text-green-500',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Project Banner Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-start lg:items-center"
      >
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-heading uppercase tracking-tight">{project.name}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${priorityColors[project.priority] || 'bg-muted text-muted-foreground'}`}>
              {project.priority} Priority
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">{project.description || 'No project description provided.'}</p>
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-bold">{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-bold text-green-500">{project.progress}%</span>
            </div>
          </div>
        </div>

        {/* Manager Card */}
        <div className="bg-muted/30 border border-border rounded-2xl p-5 flex items-center gap-4 min-w-[280px]">
          {project.manager?.avatar ? (
            <img src={project.manager.avatar} alt="Manager" className="w-12 h-12 rounded-full border-2 border-background shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
              {project.manager?.fullName?.charAt(0) || 'M'}
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Project Manager</p>
            <p className="text-sm font-bold">{project.manager?.fullName || 'Unassigned'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{project.manager?.email || 'No email available'}</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading flex items-center gap-2 px-2">
          Project Roadmap & Phases
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {phases.map((phase: any, i: number) => (
            <motion.div
              key={phase.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div 
                onClick={() => togglePhase(phase.name)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${phase.progress === 100 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {phase.progress === 100 ? <CheckCircle2 className="w-5 h-5" /> : `${i + 1}`}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">{phase.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 max-w-[120px] h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${phase.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {phase.progress}% done • {phase.taskCount} tasks
                      </span>
                    </div>
                  </div>
                </div>
                {expandedPhases[phase.name] ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </div>

              {/* Task List in Phase */}
              <div className={`border-t border-border bg-muted/10 overflow-hidden transition-all ${expandedPhases[phase.name] ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className="p-5 space-y-3">
                  {phase.tasks.map((task: any) => (
                    <div key={task._id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl group hover:border-foreground/10 transition-colors">
                      <div className="flex items-center gap-3">
                        {(task.status === 'completed' || task.status === 'done') ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className={`text-sm font-bold ${ (task.status === 'completed' || task.status === 'done') ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${statusColors[task.status] || ''}`}>
                          {task.status.replace('_', ' ')}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {phase.tasks.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-4">No tasks found in this phase.</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyProject;
