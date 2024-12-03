import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { AlertTriangle, CheckCircle2, Truck } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

// Статусы и города
const CARGO_STATUSES = [
  { value: 'pending', label: 'Ожидает отправки', color: 'text-yellow-600' },
  { value: 'in_transit', label: 'В пути', color: 'text-blue-600' },
  { value: 'delivered', label: 'Доставлен', color: 'text-green-600' },
];

const CITIES = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Нижний Новгород',
  'Екатеринбург', 'Новосибирск', 'Челябинск', 'Самара', 'Уфа', 'Омск',
];

// Утилита для генерации ID по порядку
const generateCargoId = (lastId) => {
  return `CARGO${(lastId + 1).toString().padStart(3, '0')}`;
};

// Компонент для полей формы
const FormField = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);

// Компонент приложения
const App = () => {
  const [cargoList, setCargoList] = useState([
    {
      id: 'CARGO001',
      name: 'Строительные материалы',
      status: 'in_transit',
      origin: 'Москва',
      destination: 'Казань',
      departureDate: '2024-11-24T08:00',
    },
    {
      id: 'CARGO002',
      name: 'Хрупкий груз',
      status: 'pending',
      origin: 'Санкт-Петербург',
      destination: 'Екатеринбург',
      departureDate: '2024-11-26T10:30',
    },
  ]);

  const [newCargo, setNewCargo] = useState({
    name: '',
    origin: '',
    destination: '',
    departureDate: '',
  });

  const [statusFilter, setStatusFilter] = useState('all_statuses');
  const [formError, setFormError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Рассчитываем последний ID на основе текущего списка грузов
  const lastCargoId = useMemo(() => {
    if (cargoList.length === 0) return 0;
    const lastId = cargoList[cargoList.length - 1].id;
    return parseInt(lastId.replace('CARGO', ''), 10);
  }, [cargoList]);

  const filteredCargoList = useMemo(() => {
    const filtered = statusFilter !== 'all_statuses' 
      ? cargoList.filter((cargo) => cargo.status === statusFilter)
      : cargoList;
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [cargoList, statusFilter, currentPage]);

  const totalPages = Math.ceil(
    (statusFilter !== 'all_statuses' 
      ? cargoList.filter((cargo) => cargo.status === statusFilter)
      : cargoList
    ).length / itemsPerPage
  );

  const handleStatusChange = (id, newStatus) => {
    const cargo = cargoList.find((cargo) => cargo.id === id);
    if (newStatus === 'delivered') {
      const departureDate = new Date(cargo.departureDate);
      const today = new Date();
      if (departureDate > today) {

        toast.error('Невозможно отметить как доставленный: дата отправления еще не наступила');
        return;
      }
    }

    setCargoList((prevList) =>
      prevList.map((cargo) =>
        cargo.id === id ? { ...cargo, status: newStatus } : cargo
      )
    );
  };

  const handleAddCargo = () => {
    if (!newCargo.name || !newCargo.origin || !newCargo.destination || !newCargo.departureDate) {
      setFormError('Заполните все поля');
      return;
    }

    const newId = generateCargoId(lastCargoId); // Генерируем новый ID

    setCargoList((prevList) => [
      ...prevList,
      { id: newId, ...newCargo, status: 'pending' },
    ]);
    setNewCargo({
      name: '',
      origin: '',
      destination: '',
      departureDate: '',
    });
    setFormError('');
  };

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="text-yellow-600" />;
      case 'in_transit':
        return <Truck className="text-blue-600" />;
      case 'delivered':
        return <CheckCircle2 className="text-green-600" />;
      default:
        return null;
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Добавление нового груза</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Название груза">
              <Input
                value={newCargo.name}
                onChange={(e) => setNewCargo({ ...newCargo, name: e.target.value })}
                placeholder="Введите название груза"
              />
            </FormField>
            <FormField label="Пункт отправления">
              <Select
                value={newCargo.origin}
                onValueChange={(value) => setNewCargo({ ...newCargo, origin: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent className="bg-white bg-opacity-100">
                  {CITIES.map((city) => (
                    <SelectItem 
                      key={city} 
                      value={city} 
                      className="hover:bg-gray-200" 
                    >
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Пункт назначения">
              <Select
                value={newCargo.destination}
                onValueChange={(value) => setNewCargo({ ...newCargo, destination: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent className="bg-white bg-opacity-100">
                  {CITIES.map((city) => (
                    <SelectItem 
                      key={city} 
                      value={city} 
                      className="hover:bg-gray-200" 
                    >
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Дата отправления">
              <Input
                type="datetime-local"
                value={newCargo.departureDate}
                onChange={(e) => setNewCargo({ ...newCargo, departureDate: e.target.value })}
              />
            </FormField>
          </div>
          {formError && <div className="text-red-500 mt-2">{formError}</div>}
          <Button onClick={handleAddCargo} className="mt-4">
            Добавить груз
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список грузов</CardTitle>
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1); 
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent className="bg-white bg-opacity-100">
              <SelectItem key="all-statuses" value="all_statuses">Все статусы</SelectItem>
              {CARGO_STATUSES.map((status) => (
                <SelectItem 
                  key={status.value} 
                  value={status.value} 
                  className="hover:bg-gray-200" 
                >
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Номер</th>
                  <th className="p-2 text-left">Название</th>
                  <th className="p-2 text-left">Статус</th>
                  <th className="p-2 text-left">Отправление</th>
                  <th className="p-2 text-left">Назначение</th>
                  <th className="p-2 text-left">Дата отправления</th>
                </tr>
              </thead>
              <tbody>
                {filteredCargoList.map((cargo) => (
                  <tr key={cargo.id} className="border-b">
                    <td className="p-2">{cargo.id}</td>
                    <td className="p-2">{cargo.name}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        {getStatusIcon(cargo.status)}
                        <Select
                          value={cargo.status}
                          onValueChange={(value) => handleStatusChange(cargo.id, value)}
                        >
                          <SelectTrigger className="ml-2 w-[180px]">
                            <SelectValue>
                              {CARGO_STATUSES.find((s) => s.value === cargo.status)?.label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white bg-opacity-100">
                            {CARGO_STATUSES.map((status) => (
                              <SelectItem 
                                key={status.value} 
                                value={status.value} 
                                className="hover:bg-gray-200" // Эффект затемнения при наведении
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="p-2">{cargo.origin}</td>
                    <td className="p-2">{cargo.destination}</td>
                    <td className="p-2">{new Date(cargo.departureDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <Button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    variant={currentPage === idx + 1 ? 'default' : 'outline'}
                    className="mx-1"
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Добавляем ToastContainer для отображения уведомлений */}
      <ToastContainer />
    </div>
  );
};

export default App;
