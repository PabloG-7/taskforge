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
  FaRegFrown,
  FaFire,
  FaRocket,
  FaTrophy,
  FaBell,
  FaBellSlash
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
          className={styles.taskInput}
        />
        <button onClick={addTask} aria-label="Adicionar">
          <FaPlus /> Adicionar
        </button>
      </div>

      {totalTasks > 0 && (
        <>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className={styles.stats}>
            <span>
              <FaTasks /> {totalTasks} tarefas
            </span>
            <span>
              <FaCheck /> {completedTasks} concluídas
            </span>
            <span>
              <FaFire /> {importantTasks} importantes
            </span>
            <span>
              {completionPercentage}% completo
            </span>
          </div>
        </>
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
          onClick={() => setFilter('important')} 
          className={filter === 'important' ? styles.active : ''}
        >
          <FaRocket /> Importantes
        </button>
        <button 
          onClick={() => setFilter('done')} 
          className={filter === 'done' ? styles.active : ''}
        >
          <FaRegCheckCircle /> Concluídas
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
              <p>
                {filter === 'all' 
                  ? 'Nenhuma tarefa encontrada' 
                  : filter === 'done' 
                    ? 'Nenhuma tarefa concluída ainda' 
                    : filter === 'important'
                      ? 'Nenhuma tarefa importante'
                      : 'Todas as tarefas estão concluídas!'}
              </p>
              <p>
                {filter === 'all' 
                  ? 'Comece adicionando uma nova tarefa acima!'
                  : filter === 'done'
                    ? 'Complete algumas tarefas para vê-las aqui'
                    : filter === 'important'
                      ? 'Marque tarefas como importantes para vê-las aqui'
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
                className={`${styles.taskItem} ${task.important ? styles.important : ''}`}
              >
                <div className={styles.taskContent}>
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
                      <div className={styles.taskMeta}>
                        {task.createdAt.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </span>
                  )}
                </div>
                
                <div className={styles.taskActions}>
                  <button 
                    onClick={() => toggleImportant(task.id)}
                    aria-label={task.important ? 'Remover prioridade' : 'Marcar como importante'}
                    className={task.important ? styles.importantActive : ''}
                  >
                    {task.important ? <FaFire /> : <FaBell />}
                  </button>
                  
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
                    className={styles.delete}
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

      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={styles.notification}
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}