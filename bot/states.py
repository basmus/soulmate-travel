from aiogram.fsm.state import State, StatesGroup


class AdvisorStates(StatesGroup):
    choosing_start = State()
    choosing_end = State()
    choosing_people = State()
    choosing_destination = State()
    choosing_travel = State()
    confirming = State()
    waiting_name = State()
    waiting_phone = State()


class BookingStates(StatesGroup):
    choosing_equipment = State()
    choosing_start = State()
    choosing_end = State()
    confirming = State()
    waiting_name = State()
    waiting_phone = State()


class AdminEditStates(StatesGroup):
    choosing_item = State()
    choosing_field = State()
    waiting_value = State()
