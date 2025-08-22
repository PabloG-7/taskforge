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
  FaFire,
  FaRocket,
  FaTrophy,
  FaBell,
  FaTimes,
  FaFilter
} from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: Date;
  important: boolean;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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

  const [filter, setFilter] = useState<'all' | 'done' | 'todo' | 'important'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const showToast = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const addTask = () => {
    if (!text.trim()) {
      showToast('Digite algo para adicionar uma tarefa!');
      return;
    }
    const newTask: Task = {
      id: Date.now(),
      text,
      done: false,
      createdAt: new Date(),
      important: false
    };
    setTasks([newTask, ...tasks]);
    setText('');
    showToast('Tarefa adicionada com sucesso!');
  };

  const toggleDone = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
    const task = tasks.find(t => t.id === id);
    showToast(task?.done ? 'Tarefa marcada como pendente' : 'Tarefa concluída! 🎉');
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    showToast('Tarefa removida!');
  };

  const toggleImportant = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, important: !task.important } : task
    ));
    const task = tasks.find(t => t.id === id);
    showToast(task?.important ? 'Marcada como normal' : 'Tarefa importante! ⚡');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'done') return task.done;
    if (filter === 'todo') return !task.done;
    if (filter === 'important') return task.important && !task.done;
    return true;
  });

  const startEdit = (id: number, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = (id: number) => {
    if (!editText.trim()) {
      showToast('A tarefa não pode ficar vazia!');
      return;
    }
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, text: editText } : task
    ));
    setEditingId(null);
    setEditText('');
    showToast('Tarefa atualizada!');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.done).length;
  const importantTasks = tasks.filter(task => task.important && !task.done).length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.important !== b.important) return a.important ? -1 : 1;
    if (a.done !== b.done) return a.done ? 1 : -1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.done));
    showToast('Tarefas concluídas removidas!');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>TaskForge</h1>
          <button 
            className={styles.toggleTheme} 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Alternar tema"
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
        </div>
        <p className={styles.subtitle}>Domine suas tarefas com simplicidade</p>
      </div>

      <div className={styles.inputContainer}>
        <div className={styles.inputGroup}>
          <input 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            onKeyDown={handleKeyDown}
            placeholder="O que precisa ser feito?" 
            aria-label="Adicionar nova tarefa"
            className={styles.taskInput}
          />
          <button onClick={addTask} aria-label="Adicionar" className={styles.addButton}>
            <FaPlus />
          </button>
        </div>
      </div>

      {totalTasks > 0 && (
        <div className={styles.statsContainer}>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{totalTasks}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{completedTasks}</span>
              <span className={styles.statLabel}>Concluídas</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{importantTasks}</span>
              <span className={styles.statLabel}>Importantes</span>
            </div>
          </div>
          
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span>Progresso</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <button 
          className={styles.filterToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> Filtros
        </button>
        
        {completedTasks > 0 && (
          <button 
            onClick={clearCompleted}
            className={styles.clearButton}
          >
            <FaRegTrashAlt /> Limpar
          </button>
        )}
      </div>

      {showFilters && (
        <div className={styles.filterTabs}>
          <button 
            onClick={() => {setFilter('all'); setShowFilters(false);}} 
            className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          >
            <FaListUl /> Todas
          </button>
          <button 
            onClick={() => {setFilter('todo'); setShowFilters(false);}} 
            className={`${styles.filterTab} ${filter === 'todo' ? styles.active : ''}`}
          >
            <FaTasks /> Pendentes
          </button>
          <button 
            onClick={() => {setFilter('important'); setShowFilters(false);}} 
            className={`${styles.filterTab} ${filter === 'important' ? styles.active : ''}`}
          >
            <FaRocket /> Importantes
          </button>
          <button 
            onClick={() => {setFilter('done'); setShowFilters(false);}} 
            className={`${styles.filterTab} ${filter === 'done' ? styles.active : ''}`}
          >
            <FaRegCheckCircle /> Concluídas
          </button>
        </div>
      )}

      <div className={styles.taskListContainer}>
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
                  filter === 'done' ? <FaTrophy /> : 
                  filter === 'important' ? <FaRocket /> : <FaRegCheckCircle />}
                </div>
                <h3>
                  {filter === 'all' 
                    ? 'Nenhuma tarefa' 
                    : filter === 'done' 
                      ? 'Nada concluído' 
                      : filter === 'important'
                        ? 'Nada importante'
                        : 'Tudo feito!'}
                </h3>
                <p>
                  {filter === 'all' 
                    ? 'Adicione sua primeira tarefa'
                    : filter === 'done'
                      ? 'Complete tarefas para vê-las aqui'
                      : filter === 'important'
                        ? 'Marque tarefas como importantes'
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
                  className={`${styles.taskCard} ${task.important ? styles.important : ''} ${task.done ? styles.completed : ''}`}
                >
                  <div className={styles.taskMain}>
                    <div className={styles.taskCheckboxContainer}>
                      <input 
                        type="checkbox" 
                        className={styles.taskCheckbox}
                        checked={task.done} 
                        onChange={() => toggleDone(task.id)}
                        aria-label={task.done ? 'Marcar como pendente' : 'Marcar como concluída'}
                      />
                    </div>
                    
                    <div className={styles.taskContent}>
                      {editingId === task.id ? (
                        <input
                          className={styles.taskEditInput}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                          autoFocus
                        />
                      ) : (
                        <div className={styles.taskTextContent}>
                          <span className={styles.taskTitle}>{task.text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.taskActions}>
                    <button 
                      onClick={() => toggleImportant(task.id)}
                      aria-label={task.important ? 'Remover prioridade' : 'Marcar como importante'}
                      className={`${styles.actionButton} ${task.important ? styles.importantActive : ''}`}
                    >
                      {task.important ? <FaFire /> : <FaBell />}
                    </button>
                    
                    {editingId === task.id ? (
                      <button 
                        onClick={() => saveEdit(task.id)}
                        aria-label="Salvar edição"
                        className={styles.actionButton}
                      >
                        <FaSave />
                      </button>
                    ) : (
                      <button 
                        onClick={() => startEdit(task.id, task.text)}
                        aria-label="Editar tarefa"
                        className={styles.actionButton}
                      >
                        <FaEdit />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className={`${styles.actionButton} ${styles.delete}`}
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

      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={styles.notification}
          >
            <span>{notificationMessage}</span>
            <button onClick={() => setShowNotification(false)} className={styles.notificationClose}>
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}