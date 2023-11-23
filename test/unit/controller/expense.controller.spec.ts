import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from '../../../src/feature/expense/expense.controller';
import { ExpenseService } from '../../../src/feature/expense/expense.service';
import { SuccessType } from '../../../src/enum/successType.enum';
import { ExpenseCategory } from '../../../src/enum/expenseCategory.enum';

describe('ExpenseController', () => {
  let controller: ExpenseController;
  let service: ExpenseService;

  const mockExpenseService = {
    getExpenseById: jest.fn(),
    getExpenseListByQuery: jest.fn(),
    createExpense: jest.fn(),
    updateExpense: jest.fn(),
    deleteExpense: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [
        {
          provide: ExpenseService,
          useValue: mockExpenseService,
        },
      ],
    }).compile();

    controller = module.get<ExpenseController>(ExpenseController);
    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should get expense by ID', async () => {
    const mockExpenseId = 1;

    const mockExpenseDetail = {
      id: 1,
      spentDate: '2022-01-01',
      category: 'Food',
      amount: 50,
      memo: 'Lunch',
      isCounted: true,
      user: {
        id: 1,
      },
    };

    jest.spyOn(service, 'getExpenseById').mockResolvedValue(mockExpenseDetail);

    const result = await controller.getExpenseById(mockExpenseId);

    expect(result).toEqual({
      message: SuccessType.EXPENSE_DETAIL_GET,
      data: mockExpenseDetail,
    });
    expect(service.getExpenseById).toHaveBeenCalledWith(mockExpenseId);
  });

  it('should get expense list by query', async () => {
    const mockGetExpenseDto = {
      start: '2022-01-01',
      end: '2022-01-31',
      category: ExpenseCategory.FOOD,
      minimum: '10',
      maximum: '100',
    };
    const mockExpenseList = {
      expenses: [
        {
          id: 1,
          spentDate: '2022-01-01',
          category: ExpenseCategory.FOOD,
          amount: 50,
          isCounted: true,
          user: {
            id: 1,
            username: 'testuser',
            password: 'password123',
            createdAt: new Date(),
            beforeInsert: () => {},
          },
          createdAt: new Date(),
        },
        {
          id: 2,
          spentDate: '2022-01-02',
          category: ExpenseCategory.FOOD,
          amount: 30,
          isCounted: true,
          user: {
            id: 1,
            username: 'testuser',
            password: 'password123',
            createdAt: new Date(),
            beforeInsert: () => {},
          },
          createdAt: new Date(),
        },
      ],
      totalAmount: 80,
      categoryTotalAmounts: {
        food: 80,
      },
    };

    jest
      .spyOn(service, 'getExpenseListByQuery')
      .mockResolvedValue(mockExpenseList);

    const result = await controller.getExpenseListByQuery(mockGetExpenseDto);

    expect(result).toEqual({
      message: SuccessType.EXPENSE_LIST_GET,
      data: mockExpenseList,
    });
    expect(service.getExpenseListByQuery).toHaveBeenCalledWith(
      mockGetExpenseDto,
    );
  });

  it('should create an expense', async () => {
    const mockUserId = 1;
    const mockCreateExpenseDto = {
      spentDate: '2022-01-01',
      category: ExpenseCategory.FOOD,
      amount: 50,
      memo: 'Lunch',
    };

    jest.spyOn(service, 'createExpense').mockResolvedValue(undefined);

    const result = await controller.createExpense(
      { user: { id: mockUserId } },
      mockCreateExpenseDto,
    );

    expect(result).toEqual({
      message: SuccessType.EXPENSE_CREATE,
    });
    expect(service.createExpense).toHaveBeenCalledWith(
      mockUserId,
      mockCreateExpenseDto,
    );
  });

  it('should update an expense', async () => {
    const mockExpenseId = 1;
    const mockUpdateExpenseDto = {
      isCounted: true,
    };

    jest.spyOn(service, 'updateExpense').mockResolvedValue(undefined);

    const result = await controller.updateExpense(
      mockUpdateExpenseDto,
      mockExpenseId,
    );

    expect(result).toEqual({
      message: SuccessType.EXPENSE_UPDATE,
    });
    expect(service.updateExpense).toHaveBeenCalledWith(
      mockExpenseId,
      mockUpdateExpenseDto,
    );
  });

  it('should delete an expense', async () => {
    const mockExpenseId = 1;

    jest.spyOn(service, 'deleteExpense').mockResolvedValue(undefined);

    const result = await controller.deleteExpense(mockExpenseId);

    expect(result).toEqual({
      message: SuccessType.EXPENSE_DELETE,
    });
    expect(service.deleteExpense).toHaveBeenCalledWith(mockExpenseId);
  });
});
