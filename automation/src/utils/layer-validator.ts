import { DBClient } from '../database/db-client';
import { TasksAPI } from '../api/tasks-api';
import { Task, ValidationResult } from '../types';

export class LayerValidator {
  constructor(
    private dbClient: DBClient,
    private tasksAPI: TasksAPI
  ) {}

  async validateTaskAcrossLayers(taskId: number): Promise<ValidationResult> {
    const results: ValidationResult = {
      isValid: true,
      differences: [],
    };

    // 1. Obter dados do banco
    const dbTask = await this.dbClient.getTaskById(taskId);
    
    // 2. Obter dados da API
    const apiResponse = await this.tasksAPI.getTaskById(taskId);
    const apiTask = apiResponse.data;

    // Comparar DB ↔ API
    if (dbTask && apiTask) {
      this.compareObjects('DB ↔ API', dbTask, apiTask, results);
    }

    return results;
  }

  async validateAllTasksConsistency(): Promise<ValidationResult> {
    const results: ValidationResult = {
      isValid: true,
      differences: [],
    };

    // Obter todas as tarefas do DB
    const dbTasks = await this.dbClient.getAllTasks();
    
    // Obter todas as tarefas da API
    const apiResponse = await this.tasksAPI.getAllTasks();
    const apiTasks = apiResponse.data;

    // Validar contagem
    if (dbTasks.length !== apiTasks.length) {
      results.isValid = false;
      results.differences!.push({
        field: 'task_count',
        uiValue: null,
        apiValue: apiTasks.length,
        dbValue: dbTasks.length,
      });
    }

    // Validar cada tarefa
    for (const dbTask of dbTasks) {
      const apiTask = apiTasks.find((t: Task) => t.id === dbTask.id);
      if (!apiTask) {
        results.isValid = false;
        results.differences!.push({
          field: 'task_existence',
          uiValue: null,
          apiValue: 'missing',
          dbValue: `Task ${dbTask.id} exists`,
        });
        continue;
      }

      this.compareObjects(`Task ${dbTask.id}`, dbTask, apiTask, results);
    }

    return results;
  }

  private compareObjects(context: string, obj1: any, obj2: any, results: ValidationResult): void {
    // Usar Object.keys em vez de Set para evitar problemas de iteração
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    // Combinar chaves únicas
    const allKeys = [...keys1, ...keys2].filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    
    for (const key of allKeys) {
      const val1 = obj1[key];
      const val2 = obj2[key];

      // Tratar valores undefined como string vazia para comparação
      const strVal1 = val1 !== undefined ? JSON.stringify(val1) : '';
      const strVal2 = val2 !== undefined ? JSON.stringify(val2) : '';

      if (strVal1 !== strVal2) {
        results.isValid = false;
        results.differences!.push({
          field: `${context}.${key}`,
          uiValue: null,
          apiValue: val2,
          dbValue: val1,
        });
      }
    }
  }
}