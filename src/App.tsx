import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { 
  FaRegTrashAlt, 
  FaSun, 
  FaMoon, 
  FaEdit, 
  FaSave, 
  FaPlus,
  FaCheck,
  FaListUl,
  FaTasks,
  FaRegCheckCircle,
  FaRegSmile,
  FaRegFrown
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: Date;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  const [text, setText] = useState('');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks
      ? JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }))
      : [];
  });

  const [filter, setFilter] = useState<'all' | 'done' | 'todo'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);
  

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      text,
      done: false,
      createdAt: new Date()
    };
    setTasks([newTask, ...tasks]);
    setText('');
  };

  const toggleDone = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'done') return task.done;
    if (filter === 'todo') return !task.done;
    return true;
  });

  const startEdit = (id: number, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = (id: number) => {
    if (!editText.trim()) return;
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, text: editText } : task
    ));
    setEditingId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.done).length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className={styles.container}>
      <button 
        className={styles.toggleTheme} 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label="Alternar tema"
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>

      <h1 className={styles.title}>TaskForge</h1>
      <p className={styles.subtitle}>Domine suas tarefas. Sem esforço, com foco</p>

      <div className={styles.inputGroup}>
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="O que precisa ser feito?" 
          aria-label="Adicionar nova tarefa"
        />
        <button onClick={addTask} aria-label="Adicionar">
          <FaPlus /> Adicionar
        </button>
      </div>

      {totalTasks > 0 && (
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      )}

      {totalTasks > 0 && (
        <div className={styles.stats}>
          <span>
            <FaTasks /> {totalTasks} tarefas
          </span>
          <span>
            <FaCheck /> {completedTasks} concluídas
          </span>
          <span>
            {completionPercentage}% completo
          </span>
        </div>
      )}

      <div className={styles.filtros}>
        <button 
          onClick={() => setFilter('all')} 
          className={filter === 'all' ? styles.active : ''}
        >
          <FaListUl /> Todas
        </button>
        <button 
          onClick={() => setFilter('todo')} 
          className={filter === 'todo' ? styles.active : ''}
        >
          <FaTasks /> Pendentes
        </button>
        <button 
          onClick={() => setFilter('done')} 
          className={filter === 'done' ? styles.active : ''}
        >
          <FaRegCheckCircle /> Concluídas
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        <ul className={styles.taskList}>
          {sortedTasks.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={styles.emptyState}
            >
              <div className={styles.emoji}>
                {filter === 'all' ? <FaRegSmile /> : 
                 filter === 'done' ? <FaRegFrown /> : <FaRegCheckCircle />}
              </div>
              <p>
                {filter === 'all' 
                  ? 'Nenhuma tarefa encontrada' 
                  : filter === 'done' 
                    ? 'Nenhuma tarefa concluída ainda' 
                    : 'Todas as tarefas estão concluídas!'}
              </p>
              <p>
                {filter === 'all' 
                  ? 'Comece adicionando uma nova tarefa acima!'
                  : filter === 'done'
                    ? 'Complete algumas tarefas para vê-las aqui'
                    : 'Parabéns! Você está em dia!'}
              </p>
            </motion.div>
          ) : (
            sortedTasks.map(task => (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={styles.taskItem}
              >
                <input 
                  type="checkbox" 
                  className={styles.taskCheckbox}
                  checked={task.done} 
                  onChange={() => toggleDone(task.id)}
                  aria-label={task.done ? 'Marcar como pendente' : 'Marcar como concluída'}
                />
                
                {editingId === task.id ? (
                  <input
                    className={styles.taskTitle}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                    autoFocus
                  />
                ) : (
                  <span className={`${styles.taskTitle} ${task.done ? styles.done : ''}`}>
                    {task.text}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {task.createdAt.toLocaleDateString()}
                    </div>
                  </span>
                )}
                
                <div className={styles.taskActions}>
                  {editingId === task.id ? (
                    <button 
                      onClick={() => saveEdit(task.id)}
                      aria-label="Salvar edição"
                    >
                      <FaSave />
                    </button>
                  ) : (
                    <button 
                      onClick={() => startEdit(task.id, task.text)}
                      aria-label="Editar tarefa"
                    >
                      <FaEdit />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="delete"
                    aria-label="Excluir tarefa"
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </motion.li>
            ))
          )}
        </ul>
      </AnimatePresence>
    </div>
  );
}