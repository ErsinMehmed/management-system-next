import React, { useEffect, useState, useMemo } from "react";
import Select from "@/components/html/Select";
import Input from "@/components/html/Input";
import userAction from "@/actions/userAction";
import { userStore, productStore, commonStore } from "@/stores/useStore";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
} from "@nextui-org/react";
import { FaCheck } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";
import { productTitle } from "@/utils";

const UserAviability = () => {
  const { users, loadUserSales } = userStore;
  const { products } = productStore;
  const { errorMessage, setErrorMessage } = commonStore;
  const [stateUserId, setUserId] = useState(users?.users[0]?._id);
  const [userAviability, setUserAviability] = useState([]);
  const [isLoadingUserAviability, setIsLoadingUserAviability] = useState(false);
  const [isUpdateLoaded, setIsUpdateLoaded] = useState(false);
  const [isAddingNewStock, setIsAddingNewStock] = useState(false);
  const [newStockData, setNewStockData] = useState({
    userId: stateUserId,
    productId: "",
    stock: "",
  });
  const selectedUserId = users?.users[0]?._id ?? "";

  useEffect(() => {
    loadUserAviability(selectedUserId);
  }, []);

  const loadUserAviability = async (userId) => {
    try {
      setIsLoadingUserAviability(true);
      const data = await userAction.getUserStocks(userId);
      setUserAviability(data);
    } finally {
      setIsLoadingUserAviability(false);
    }
  };

  const handleStockChange = (productId, newValue) => {
    setUserAviability((prev) => ({
      ...prev,
      data: prev.data.map((product) =>
        product.id === productId ? { ...product, stock: newValue } : product
      ),
    }));
  };

  const handleUpdateUserStocks = async (productId) => {
    const productToUpdate = userAviability.data.find(
      (product) => product.id === productId
    );

    if (productToUpdate) {
      try {
        setIsUpdateLoaded((prev) => ({ ...prev, [productId]: true }));
        await userAction.updateUserStocks(productToUpdate);
        loadUserSales();
      } finally {
        const data = await userAction.getUserStocks(productToUpdate.userId);
        setUserAviability(data);
        setIsUpdateLoaded((prev) => ({ ...prev, [productId]: false }));
      }
    }
  };

  const handleAddNewStock = async () => {
    if (newStockData.productId && newStockData.userId && newStockData.stock) {
      const response = await userAction.addUserStock(newStockData);

      if (response.status) {
        loadUserSales();
        loadUserAviability(newStockData.userId);
        setIsAddingNewStock(false);
        setNewStockData({ userId: stateUserId, productId: "", stock: "" });
      }

      if (!response.status) {
        setErrorMessage(response.message);
      }
    }
  };

  const updatedProducts = useMemo(() => {
    return products
      .filter((product) => !product.hidden)
      .map((product) => ({
        ...product,
        name: productTitle(product),
      }));
  }, [products]);

  return (
    <div className="space-y-4 mt-2.5">
      <Select
        items={users.users}
        label="Избери потребител"
        value={selectedUserId}
        onChange={(value) => {
          loadUserAviability(value);
          setUserId(selectedUserId);
        }}
      />

      <Table
        isStriped
        classNames={{
          table: "min-h-[200px]",
        }}
      >
        <TableHeader>
          <TableColumn>ПРОДУКТ</TableColumn>
          <TableColumn>НАЛИЧНОСТ</TableColumn>
          <TableColumn>ДЕЙСТВИЯ</TableColumn>
        </TableHeader>

        <TableBody
          isLoading={isLoadingUserAviability}
          loadingContent={<Spinner label="Зареждане..." />}
          emptyContent={userAviability?.message}
        >
          {userAviability.data?.map((product, index) => (
            <TableRow key={index}>
              <TableCell>{product.productName}</TableCell>

              <TableCell>
                <Input
                  type="text"
                  label="Наличност"
                  value={product.stock || ""}
                  onChange={(value) => handleStockChange(product.id, value)}
                  isDisabled={isUpdateLoaded[product.id]}
                  inputWrapperClasses={
                    index % 2 !== 0 ? "bg-white focus-within:!bg-blue-50" : ""
                  }
                />
              </TableCell>

              <TableCell>
                <Button
                  onClick={() => handleUpdateUserStocks(product.id)}
                  isIconOnly
                  color="primary"
                  aria-label="Save"
                  isDisabled={isUpdateLoaded[product.id]}
                >
                  <FaCheck className="size-5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {isAddingNewStock && (
            <TableRow>
              <TableCell>
                <Select
                  items={updatedProducts}
                  label="Продукт"
                  value={newStockData.productId}
                  onChange={(value) =>
                    setNewStockData((prev) => ({ ...prev, productId: value }))
                  }
                />
              </TableCell>

              <TableCell>
                <Input
                  type="text"
                  label="Наличност"
                  value={newStockData.stock}
                  onChange={(value) =>
                    setNewStockData((prev) => ({ ...prev, stock: value }))
                  }
                />
              </TableCell>

              <TableCell>
                <Button
                  onClick={handleAddNewStock}
                  isIconOnly
                  color="primary"
                  aria-label="Save"
                >
                  <FiPlus className="size-5" />
                </Button>
              </TableCell>
            </TableRow>
          )}

          {!isLoadingUserAviability && !isAddingNewStock && (
            <TableRow>
              <TableCell></TableCell>

              <TableCell className="text-center pt-3">
                <Button
                  isIconOnly
                  color="default"
                  radius="full"
                  variant="bordered"
                  onClick={() => setIsAddingNewStock(true)}
                >
                  <FiPlus className="size-5" />
                </Button>
              </TableCell>

              <TableCell></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserAviability;
