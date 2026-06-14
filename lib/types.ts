export interface IUniversity {
    _id: string;
    name: string;
    code: string;
    faculties: IFaculty['_id'][]
}

export interface IFaculty {
    _id: string;
    name: string;
    university: {
        name: IUniversity['name'];
        id:  IUniversity['_id'];
    }
    departments: IDepartment['_id'][]
}

export interface IDepartment {
    _id: string;
    name: string;
    university: {
        name: IUniversity['name'];
        id: IUniversity['_id'];
    };
    faculty: {
        name: IFaculty['name'];
        id: IFaculty['_id'];
    };
    programs: IProgram['_id'][]
}

export interface IProgram {
    _id: string;
    name: string;
    level: string;
    university: {
        name: IUniversity['name'];
        id: IUniversity['_id'];
    };
    faculty: {
        name: IFaculty['name'];
        id: IFaculty['_id'];
    };
    department: {
        name: IDepartment['name'];
        id: IDepartment['_id'];
    };
    courses: ICourse['_id'][]
}

export interface ICourse {
    _id: string;
    names: string[];
    codes: string[];
    lecturers: string[];
    level: string;
    university: {
        name: IUniversity['name'];
        id: IUniversity['_id'];
    };
    faculty: {
        name: IFaculty['name'];
        id: IFaculty['_id'];
    };
    department: {
        name: IDepartment['name'];
        id: IDepartment['_id'];
    };
    programs: [{
        name: IProgram['name'];
        programId: IProgram['_id'];
    }];
    papers: IPaper['_id'][]
}

export interface IPaper {
    _id: string;
    title: string;
    university: {
        name: IUniversity['name'];
        code: IUniversity['code'];
        id: IUniversity['_id'];
    };
    faculty: {
        name: IFaculty['name'];
        id: IFaculty['_id'];
    };
    department: {
        name: IDepartment['name'];
        id: IDepartment['_id'];
    };
    program: {
        name: IProgram['name'];
        id: IProgram['_id'];
    };
    course:  {
        name: ICourse['names'];
        id: ICourse['_id'];
        code: ICourse['codes'];
    };
    year: string;
    paperType: string;
    internalExaminer: string;
    externalExaminer: string;
    url: string;
    thumbnailUrl?: string;
    description: string;
    author: {
        id: string;
        name: string
    };
    createdAt: string;
    updatedAt: string;
}

export interface IStudent {
    _id: string;
    name: string;
    email: string;
    bio: string;
    image: string;
    streak: number;
    lastLogin: string | Date;
    university: {
        name: IUniversity['name'];
        id: IUniversity['_id'];
    };
    faculty: {
        name: IFaculty['name'];
        id: IFaculty['_id'];
    };
    department: {
        name: IDepartment['name'];
        id: IDepartment['_id'];
    };
    program: {
        name: IProgram['name'];
        id: IProgram['_id'];
    };
}