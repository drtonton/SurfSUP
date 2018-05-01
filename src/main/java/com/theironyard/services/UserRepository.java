package com.theironyard.services;

import com.theironyard.entities.User;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by keatonfoster on 4/6/16.
 */
public interface UserRepository extends CrudRepository<User, Integer> {
    User findByUsername(String username);
}