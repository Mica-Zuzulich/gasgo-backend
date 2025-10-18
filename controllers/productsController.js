let products = [
  { id: 1, nombre: 'Garrafa 10kg', precio: 5000 },
  { id: 2, nombre: 'Garrafa 15kg', precio: 7000 },
];

export const getProducts = (req, res) => {
  res.json(products);
};

export const getProductById = (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === parseInt(id));
  product ? res.json(product) : res.status(404).json({ message: 'Producto no encontrado' });
};

export const createProduct = (req, res) => {
  const newProduct = {
    id: products.length + 1,
    ...req.body,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
};

export const updateProduct = (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === parseInt(id));

  if (index !== -1) {
    products[index] = { id: parseInt(id), ...req.body };
    res.json(products[index]);
  } else {
    res.status(404).json({ message: 'Producto no encontrado' });
  }
};

export const deleteProduct = (req, res) => {
  const { id } = req.params;
  products = products.filter((p) => p.id !== parseInt(id));
  res.json({ message: 'Producto eliminado' });
};
