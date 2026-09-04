package com.sunrise.dental.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class HelpControllerTest {

    @Test
    void shouldReturnHelpInstructions() throws Exception {
        HelpController controller = new HelpController();
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get("/api/help"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Sunrise Dental Clinic Help"))
                .andExpect(jsonPath("$.steps[0]").value("1. Login with your clinic username and password."));
    }
}
