package com.cakebusiness.service;

import com.cakebusiness.entity.Category;
import com.cakebusiness.entity.Product;
import com.cakebusiness.repository.CategoryRepository;
import com.cakebusiness.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getAvailableProducts() {
        return productRepository.findByAvailableTrue();
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndAvailableTrue();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found with id: " + id
                        ));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public Product createProduct(Product product) {

        if (product.getCategory() != null
                && product.getCategory().getId() != null) {

            Category category = categoryRepository
                    .findById(product.getCategory().getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Category not found with id: "
                                            + product.getCategory().getId()
                            ));

            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {

        Product existingProduct = getProductById(id);

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());
        existingProduct.setWeight(updatedProduct.getWeight());
        existingProduct.setEggless(updatedProduct.getEggless());
        existingProduct.setAvailable(updatedProduct.getAvailable());
        existingProduct.setFeatured(updatedProduct.getFeatured());

        if (updatedProduct.getCategory() != null
                && updatedProduct.getCategory().getId() != null) {

            Category category = categoryRepository
                    .findById(updatedProduct.getCategory().getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Category not found with id: "
                                            + updatedProduct.getCategory().getId()
                            ));

            existingProduct.setCategory(category);
        }

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {

        Product product = getProductById(id);

        productRepository.delete(product);
    }
}