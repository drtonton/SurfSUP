package com.theironyard.services;

import com.theironyard.entities.Sesh;
import com.theironyard.entities.User;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by keatonfoster on 4/7/16.
 */
public interface SeshRepository extends CrudRepository<Sesh, Integer>{
    List<Sesh> findAllByUser (User user);
}
