import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  LocalDate: any;
  UUID: any;
  Upload: any;
};

export enum AssignmentAction {
  Assign = 'ASSIGN',
  Nop = 'NOP',
  Unassign = 'UNASSIGN'
}

export type DomainSimple = {
  __typename?: 'DomainSimple';
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type IntellectualProperty = {
  __typename?: 'IntellectualProperty';
  description: Scalars['String'];
  domain: DomainSimple;
  id: Scalars['Int'];
  tasks?: Maybe<Array<Task>>;
};

export type IntellectualPropertyData = {
  description: Scalars['String'];
};

export type KPiREntry = {
  __typename?: 'KPiREntry';
  additionalCostOfPurchase: Scalars['BigDecimal'];
  bookingNumber: Scalars['String'];
  comments: Scalars['String'];
  counterparty: Scalars['String'];
  counterpartyAddress: Scalars['String'];
  description: Scalars['String'];
  domain: DomainSimple;
  entryDate: Scalars['LocalDate'];
  entryOrder: Scalars['Int'];
  otherExpenses: Scalars['BigDecimal'];
  otherIncomes: Scalars['BigDecimal'];
  providedGoodsAndServicesValue: Scalars['BigDecimal'];
  publicId: Scalars['UUID'];
  purchasedGoodsAndMaterialsValue: Scalars['BigDecimal'];
  remunerationInCashOrInKind: Scalars['BigDecimal'];
  totalExpenses: Scalars['BigDecimal'];
  totalIncomes: Scalars['BigDecimal'];
};

export type KPiREntryInput = {
  additionalCostOfPurchase: Scalars['BigDecimal'];
  bookingNumber: Scalars['String'];
  comments: Scalars['String'];
  counterparty: Scalars['String'];
  counterpartyAddress: Scalars['String'];
  description: Scalars['String'];
  entryDate: Scalars['LocalDate'];
  entryOrder: Scalars['Int'];
  otherExpenses: Scalars['BigDecimal'];
  otherIncomes: Scalars['BigDecimal'];
  providedGoodsAndServicesValue: Scalars['BigDecimal'];
  publicId?: InputMaybe<Scalars['UUID']>;
  purchasedGoodsAndMaterialsValue: Scalars['BigDecimal'];
  remunerationInCashOrInKind: Scalars['BigDecimal'];
  totalExpenses: Scalars['BigDecimal'];
  totalIncomes: Scalars['BigDecimal'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addIPR?: Maybe<IntellectualProperty>;
  addKPiREntry?: Maybe<KPiREntry>;
  assignCategoryToTimeRecord: Scalars['String'];
  createTask: Scalars['String'];
  createTimeRecord: Scalars['String'];
  createTimeRecordCategory: TimeRecordCategory;
  deleteIPR: Scalars['String'];
  deleteTask: Scalars['String'];
  deleteTimeRecord: Scalars['String'];
  deleteTimeRecordCategory: Scalars['String'];
  updateIPR?: Maybe<IntellectualProperty>;
  updateTask: Scalars['String'];
  updateTimeRecord: Scalars['String'];
  updateTimeRecordCategory: Scalars['String'];
};


export type MutationAddIprArgs = {
  input?: InputMaybe<IntellectualPropertyData>;
};


export type MutationAddKPiREntryArgs = {
  input?: InputMaybe<KPiREntryInput>;
};


export type MutationAssignCategoryToTimeRecordArgs = {
  timeRecordCategoryId?: InputMaybe<Scalars['Int']>;
  timeRecordId: Scalars['Int'];
};


export type MutationCreateTaskArgs = {
  intellectualPropertyId: Scalars['Int'];
  taskData: TaskData;
};


export type MutationCreateTimeRecordArgs = {
  timeRecordData: TimeRecordData;
};


export type MutationCreateTimeRecordCategoryArgs = {
  name: Scalars['String'];
};


export type MutationDeleteIprArgs = {
  intellectualPropertyId: Scalars['Int'];
};


export type MutationDeleteTaskArgs = {
  taskId: Scalars['Int'];
};


export type MutationDeleteTimeRecordArgs = {
  timeRecordId: Scalars['Int'];
};


export type MutationDeleteTimeRecordCategoryArgs = {
  timeRecordId: Scalars['Int'];
};


export type MutationUpdateIprArgs = {
  input?: InputMaybe<IntellectualPropertyData>;
  intellectualPropertyId: Scalars['Int'];
};


export type MutationUpdateTaskArgs = {
  taskData: TaskData;
  taskId: Scalars['Int'];
};


export type MutationUpdateTimeRecordArgs = {
  timeRecordData: TimeRecordData;
  timeRecordId: Scalars['Int'];
};


export type MutationUpdateTimeRecordCategoryArgs = {
  name: Scalars['String'];
  timeRecordId: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  allIPRs: Array<IntellectualProperty>;
  allTimeRecordCategories: Array<TimeRecordCategory>;
  monthKPIR?: Maybe<Array<KPiREntry>>;
  nonIPTimeRecords: Array<TimeRecord>;
};


export type QueryMonthKpirArgs = {
  month: Scalars['Int'];
  year: Scalars['Int'];
};

export type Task = {
  __typename?: 'Task';
  attachments?: Maybe<Array<Scalars['String']>>;
  coAuthors: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['Int'];
  timeRecords?: Maybe<Array<TimeRecord>>;
};

export type TaskData = {
  coAuthors: Scalars['String'];
  description: Scalars['String'];
};

export type TimeRecord = {
  __typename?: 'TimeRecord';
  date: Scalars['LocalDate'];
  description?: Maybe<Scalars['String']>;
  domain: DomainSimple;
  id: Scalars['Int'];
  numberOfHours: Scalars['BigDecimal'];
  timeRecordCategory?: Maybe<TimeRecordCategory>;
};

export type TimeRecordCategory = {
  __typename?: 'TimeRecordCategory';
  domain: DomainSimple;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type TimeRecordData = {
  assignmentAction: AssignmentAction;
  date: Scalars['LocalDate'];
  description: Scalars['String'];
  numberOfHours: Scalars['BigDecimal'];
  taskId?: InputMaybe<Scalars['Int']>;
};

export type GetAllDomainIntellectualPropertiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllDomainIntellectualPropertiesQuery = { __typename?: 'Query', allIPRs: Array<{ __typename?: 'IntellectualProperty', id: number, description: string, tasks?: Array<{ __typename?: 'Task', id: number, attachments?: Array<string> | null, coAuthors: string, description: string, timeRecords?: Array<{ __typename?: 'TimeRecord', id: number, date: any, numberOfHours: any, description?: string | null, timeRecordCategory?: { __typename?: 'TimeRecordCategory', id: number, name: string } | null, domain: { __typename?: 'DomainSimple', id: number, name: string } }> | null }> | null, domain: { __typename?: 'DomainSimple', id: number, name: string } }> };

export type AddIprMutationVariables = Exact<{
  description: Scalars['String'];
}>;


export type AddIprMutation = { __typename?: 'Mutation', addIPR?: { __typename?: 'IntellectualProperty', id: number, description: string, tasks?: Array<{ __typename?: 'Task', id: number, attachments?: Array<string> | null, coAuthors: string, description: string, timeRecords?: Array<{ __typename?: 'TimeRecord', id: number, date: any, numberOfHours: any, description?: string | null, timeRecordCategory?: { __typename?: 'TimeRecordCategory', id: number, name: string } | null, domain: { __typename?: 'DomainSimple', id: number, name: string } }> | null }> | null, domain: { __typename?: 'DomainSimple', id: number, name: string } } | null };

export type UpdateIprMutationVariables = Exact<{
  intellectualPropertyId: Scalars['Int'];
  description: Scalars['String'];
}>;


export type UpdateIprMutation = { __typename?: 'Mutation', updateIPR?: { __typename?: 'IntellectualProperty', id: number, description: string, tasks?: Array<{ __typename?: 'Task', id: number, attachments?: Array<string> | null, coAuthors: string, description: string, timeRecords?: Array<{ __typename?: 'TimeRecord', id: number, date: any, numberOfHours: any, description?: string | null, timeRecordCategory?: { __typename?: 'TimeRecordCategory', id: number, name: string } | null, domain: { __typename?: 'DomainSimple', id: number, name: string } }> | null }> | null, domain: { __typename?: 'DomainSimple', id: number, name: string } } | null };

export type DeleteIprMutationVariables = Exact<{
  intellectualPropertyId: Scalars['Int'];
}>;


export type DeleteIprMutation = { __typename?: 'Mutation', deleteIPR: string };

export type CreateTaskMutationVariables = Exact<{
  intellectualPropertyId: Scalars['Int'];
  coAuthors: Scalars['String'];
  description: Scalars['String'];
}>;


export type CreateTaskMutation = { __typename?: 'Mutation', createTask: string };

export type UpdateTaskMutationVariables = Exact<{
  taskId: Scalars['Int'];
  coAuthors: Scalars['String'];
  description: Scalars['String'];
}>;


export type UpdateTaskMutation = { __typename?: 'Mutation', updateTask: string };

export type DeleteTaskMutationVariables = Exact<{
  taskId: Scalars['Int'];
}>;


export type DeleteTaskMutation = { __typename?: 'Mutation', deleteTask: string };

export type GetAllDomainNonIpTimeRecordsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllDomainNonIpTimeRecordsQuery = { __typename?: 'Query', nonIPTimeRecords: Array<{ __typename?: 'TimeRecord', id: number, date: any, numberOfHours: any, description?: string | null, timeRecordCategory?: { __typename?: 'TimeRecordCategory', id: number, name: string } | null, domain: { __typename?: 'DomainSimple', id: number, name: string } }> };

export type CreateTimeRecordMutationVariables = Exact<{
  taskId?: InputMaybe<Scalars['Int']>;
  date: Scalars['LocalDate'];
  numberOfHours: Scalars['BigDecimal'];
  description: Scalars['String'];
  assignmentAction: AssignmentAction;
}>;


export type CreateTimeRecordMutation = { __typename?: 'Mutation', createTimeRecord: string };

export type UpdateTimeRecordMutationVariables = Exact<{
  timeRecordId: Scalars['Int'];
  taskId?: InputMaybe<Scalars['Int']>;
  date: Scalars['LocalDate'];
  numberOfHours: Scalars['BigDecimal'];
  description: Scalars['String'];
  assignmentAction: AssignmentAction;
}>;


export type UpdateTimeRecordMutation = { __typename?: 'Mutation', updateTimeRecord: string };

export type DeleteTimeRecordMutationVariables = Exact<{
  timeRecordId: Scalars['Int'];
}>;


export type DeleteTimeRecordMutation = { __typename?: 'Mutation', deleteTimeRecord: string };

export type GetAllDomainTimeRecordCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllDomainTimeRecordCategoriesQuery = { __typename?: 'Query', allTimeRecordCategories: Array<{ __typename?: 'TimeRecordCategory', id: number, name: string, domain: { __typename?: 'DomainSimple', id: number, name: string } }> };

export type CreateTimeRecordCategoryMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CreateTimeRecordCategoryMutation = { __typename?: 'Mutation', createTimeRecordCategory: { __typename?: 'TimeRecordCategory', id: number, name: string, domain: { __typename?: 'DomainSimple', id: number, name: string } } };

export type UpdateTimeRecordCategoryMutationVariables = Exact<{
  timeRecordId: Scalars['Int'];
  name: Scalars['String'];
}>;


export type UpdateTimeRecordCategoryMutation = { __typename?: 'Mutation', updateTimeRecordCategory: string };

export type DeleteTimeRecordCategoryMutationVariables = Exact<{
  timeRecordId: Scalars['Int'];
}>;


export type DeleteTimeRecordCategoryMutation = { __typename?: 'Mutation', deleteTimeRecordCategory: string };

export type AssignCategoryToTimeRecordMutationVariables = Exact<{
  timeRecordId: Scalars['Int'];
  timeRecordCategoryId?: InputMaybe<Scalars['Int']>;
}>;


export type AssignCategoryToTimeRecordMutation = { __typename?: 'Mutation', assignCategoryToTimeRecord: string };


export const GetAllDomainIntellectualProperties = gql`
    query GetAllDomainIntellectualProperties {
  allIPRs {
    id
    description
    tasks {
      id
      attachments
      coAuthors
      description
      timeRecords {
        id
        date
        numberOfHours
        description
        timeRecordCategory {
          id
          name
        }
        domain {
          id
          name
        }
      }
    }
    domain {
      id
      name
    }
  }
}
    `;
export const AddIpr = gql`
    mutation AddIPR($description: String!) {
  addIPR(input: {description: $description}) {
    id
    description
    tasks {
      id
      attachments
      coAuthors
      description
      timeRecords {
        id
        date
        numberOfHours
        description
        timeRecordCategory {
          id
          name
        }
        domain {
          id
          name
        }
      }
    }
    domain {
      id
      name
    }
  }
}
    `;
export const UpdateIpr = gql`
    mutation UpdateIPR($intellectualPropertyId: Int!, $description: String!) {
  updateIPR(
    intellectualPropertyId: $intellectualPropertyId
    input: {description: $description}
  ) {
    id
    description
    tasks {
      id
      attachments
      coAuthors
      description
      timeRecords {
        id
        date
        numberOfHours
        description
        timeRecordCategory {
          id
          name
        }
        domain {
          id
          name
        }
      }
    }
    domain {
      id
      name
    }
  }
}
    `;
export const DeleteIpr = gql`
    mutation DeleteIPR($intellectualPropertyId: Int!) {
  deleteIPR(intellectualPropertyId: $intellectualPropertyId)
}
    `;
export const CreateTask = gql`
    mutation CreateTask($intellectualPropertyId: Int!, $coAuthors: String!, $description: String!) {
  createTask(
    intellectualPropertyId: $intellectualPropertyId
    taskData: {coAuthors: $coAuthors, description: $description}
  )
}
    `;
export const UpdateTask = gql`
    mutation UpdateTask($taskId: Int!, $coAuthors: String!, $description: String!) {
  updateTask(
    taskId: $taskId
    taskData: {coAuthors: $coAuthors, description: $description}
  )
}
    `;
export const DeleteTask = gql`
    mutation DeleteTask($taskId: Int!) {
  deleteTask(taskId: $taskId)
}
    `;
export const GetAllDomainNonIpTimeRecords = gql`
    query GetAllDomainNonIPTimeRecords {
  nonIPTimeRecords {
    id
    date
    numberOfHours
    description
    timeRecordCategory {
      id
      name
    }
    domain {
      id
      name
    }
  }
}
    `;
export const CreateTimeRecord = gql`
    mutation CreateTimeRecord($taskId: Int, $date: LocalDate!, $numberOfHours: BigDecimal!, $description: String!, $assignmentAction: AssignmentAction!) {
  createTimeRecord(
    timeRecordData: {taskId: $taskId, date: $date, numberOfHours: $numberOfHours, description: $description, assignmentAction: $assignmentAction}
  )
}
    `;
export const UpdateTimeRecord = gql`
    mutation UpdateTimeRecord($timeRecordId: Int!, $taskId: Int, $date: LocalDate!, $numberOfHours: BigDecimal!, $description: String!, $assignmentAction: AssignmentAction!) {
  updateTimeRecord(
    timeRecordId: $timeRecordId
    timeRecordData: {taskId: $taskId, date: $date, numberOfHours: $numberOfHours, description: $description, assignmentAction: $assignmentAction}
  )
}
    `;
export const DeleteTimeRecord = gql`
    mutation DeleteTimeRecord($timeRecordId: Int!) {
  deleteTimeRecord(timeRecordId: $timeRecordId)
}
    `;
export const GetAllDomainTimeRecordCategories = gql`
    query GetAllDomainTimeRecordCategories {
  allTimeRecordCategories {
    id
    name
    domain {
      id
      name
    }
  }
}
    `;
export const CreateTimeRecordCategory = gql`
    mutation CreateTimeRecordCategory($name: String!) {
  createTimeRecordCategory(name: $name) {
    id
    name
    domain {
      id
      name
    }
  }
}
    `;
export const UpdateTimeRecordCategory = gql`
    mutation UpdateTimeRecordCategory($timeRecordId: Int!, $name: String!) {
  updateTimeRecordCategory(timeRecordId: $timeRecordId, name: $name)
}
    `;
export const DeleteTimeRecordCategory = gql`
    mutation DeleteTimeRecordCategory($timeRecordId: Int!) {
  deleteTimeRecordCategory(timeRecordId: $timeRecordId)
}
    `;
export const AssignCategoryToTimeRecord = gql`
    mutation AssignCategoryToTimeRecord($timeRecordId: Int!, $timeRecordCategoryId: Int) {
  assignCategoryToTimeRecord(
    timeRecordId: $timeRecordId
    timeRecordCategoryId: $timeRecordCategoryId
  )
}
    `;